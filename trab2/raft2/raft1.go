package raft

import "sync"
import "labrpc"
import "time"
import "math/rand"

const (
	// State machine enumerator
	Follower = iota
	Candidate
	Leader
)

// Referenced in the paper, but it isn't clear as of yet if it ApplyMsg sufices
type LogEntry struct {
	Command interface{}
	Term    int
}

type ApplyMsg struct {
	Index       int
	Command     interface{}
	UseSnapshot bool   // ignore for lab2; only used in lab3
	Snapshot    []byte // ignore for lab2; only used in lab3
}

type Raft struct {
	mu        sync.Mutex          // Lock to protect shared access to this peer's state
	peers     []*labrpc.ClientEnd // RPC end points of all peers
	persister *Persister          // Object to hold this peer's persisted state
	me        int                 // this peer's index into peers[]
	applyCh   chan ApplyMsg
	//////////////////////////////////////////////////////////////////////////
	// All of the bellow values are stated in the figure 2 of the paper
	state    int       // [Follower,Candidate,Leader][state]
	lastSeen time.Time // Last time a Leader reached out to "me" that had the right term, or, last time "me", the leader, sent a heartbeat.
	// Persistent
	currentTerm  int
	votedFor     int // stores candidateId
	log          []LogEntry
	lastLogIndex int
	// Volatile on leader
	nextIndex  []int
	matchIndex []int
	//////////////////////////////////////////////////////////////////////////
}

func (rf *Raft) GetState() (int, bool) {
	// corrida
	return rf.currentTerm, rf.state == Leader
}
func (rf *Raft) GetMachineState() int {
	rf.mu.Lock()
	state := rf.state
	rf.mu.Unlock()
	return state
}

// save Raft's persistent state to stable storage,
// where it can later be retrieved after a crash and restart.
// see paper's Figure 2 for a description of what should be persistent.
func (rf *Raft) persist() {
	// Your code here (2C).
	// Example:
	// w := new(bytes.Buffer)
	// e := gob.NewEncoder(w)
	// e.Encode(rf.xxx)
	// e.Encode(rf.yyy)
	// data := w.Bytes()
	// rf.persister.SaveRaftState(data)
}

// restore previously persisted state.
func (rf *Raft) readPersist(data []byte) {
	// Your code here (2C).
	// Example:
	// r := bytes.NewBuffer(data)
	// d := gob.NewDecoder(r)
	// d.Decode(&rf.xxx)
	// d.Decode(&rf.yyy)
	if data == nil || len(data) < 1 { // bootstrap without any state?
		return
	}
}

type RequestVoteArgs struct {
	Term         int
	CandidateId  int
	LastLogIndex int // Not needed for 2A
	LastLogTerm  int // Not needed for 2A
}

type RequestVoteReply struct {
	Term        int
	VoteGranted bool
}

func (rf *Raft) RequestVote(args *RequestVoteArgs, reply *RequestVoteReply) {
	rf.mu.Lock()
	defer rf.mu.Unlock()

	// Already voted on him this term, reassure him.
	if args.Term == rf.currentTerm && rf.votedFor == args.CandidateId {
		reply.Term = args.Term
		reply.VoteGranted = true
		return
	}
	// Vote requester either has the wrong term or self has already voted
	if args.Term < rf.currentTerm || (rf.currentTerm == args.Term && rf.votedFor != -1) {
		reply.Term = rf.currentTerm
		reply.VoteGranted = false
		return
	}

	if args.Term > rf.currentTerm { // I'm outdated. Vote on him as well
		rf.currentTerm = args.Term
		rf.votedFor = -1
		rf.state = Follower
	}

	rf.lastSeen = time.Now()
	// corrida
	reply.Term = args.Term
	reply.VoteGranted = true
	// corrida
	rf.votedFor = args.CandidateId
}

func (rf *Raft) sendRequestVote(server int, args *RequestVoteArgs, reply *RequestVoteReply) bool {
	// corrida
	ok := rf.peers[server].Call("Raft.RequestVote", args, reply)
	return ok
}

/////////////

type AppendEntriesArgs struct {
	Term     int
	LeaderId int
	// rest of arguments are ignorable
}

type AppendEntriesReply struct {
	Term    int
	Success bool
}

func (rf *Raft) AppendEntries(args *AppendEntriesArgs, reply *AppendEntriesReply) {
	rf.mu.Lock()
	defer rf.mu.Unlock()
	if args.Term < rf.currentTerm { // Requester is outdated. Tell him the right Tern
		reply.Term = rf.currentTerm
		reply.Success = false
		return
	}
	rf.lastSeen = time.Now() // All good to Go! Respond nicely~
	reply.Term = rf.currentTerm
	reply.Success = true
}

func (rf *Raft) sendAppendEntries(server int, args *AppendEntriesArgs, reply *AppendEntriesReply) bool {
	ok := rf.peers[server].Call("Raft.AppendEntries", args, reply)
	return ok
}

func (rf *Raft) Start(command interface{}) (int, int, bool) {
	index := -1
	term := -1
	isLeader := true

	// Your code here (2B).

	return index, term, isLeader
}

func (rf *Raft) Kill() {
	// Your code here, if desired.
}

const minElectionTime = 800
const maxElectionTime = 2000

func randTimeout() time.Duration {
	randTimeout := minElectionTime + rand.Intn(maxElectionTime-minElectionTime)
	return time.Duration(randTimeout) * time.Millisecond
}

func (rf *Raft) Follower() {
	// Sleep until (last_heartbeat + timeout == now), where timeout is the random time of 150-300 mentioned in the paper. Sleep((timeout - (now - last_heartbeat))
	rng := randTimeout()
	waitFor := rng - (time.Since(rf.lastSeen)) // Arithimetic required to sleep for the correct amount of time. Rng would sufice, but would cause a longer sleep than specified by min/maxElectiontime
	time.Sleep(waitFor)

	// Check if something happend while asleep
	if rf.state != Follower {
		return
	}
	// Check if last_heartbeat + timeout is smaller than now. If it is, a timeout happend
	if time.Now().After(rf.lastSeen.Add(rng)) {
		rf.mu.Lock()
		// corrida
		rf.state = Candidate
		rf.currentTerm = rf.currentTerm + 1
		rf.votedFor = -1

		rf.mu.Unlock()
	}
}

func AsyncTimeout(duration time.Duration, exitForStatus chan int) {
	// corrida
	time.Sleep(duration)
	// corrida
	exitForStatus <- 0 // Will only matter if it times out before any other function sends 1 to this channel
}

func (rf *Raft) CountVotes(total int, majority int, exitForStatus chan int, increaseCount chan int) {
	count := 0
	finished := 0
	for count < majority && finished < total {
		i := <-increaseCount
		if i == 0 {
			finished++ // Vote not granted, or timedout request
		} else if i == 1 {
			count++ // Vote granted
			finished++
		} else { // exitForStatus was probably called
			return
		}
	}
	if count < majority {
		exitForStatus <- 0 // Didn't get majority, return 0
	} else {
		exitForStatus <- 1 // Got majority! Should become the leader
	}
}

func (rf *Raft) awaitVotes(peer int, args RequestVoteArgs, increaseCount chan int) {
	reply := RequestVoteReply{}
	ok := rf.sendRequestVote(peer, &args, &reply)

	// fmt.Println(rf.me,":",strings.Repeat(" ", rf.me*30),"Trying to get to increaseCount")
	if !ok {
		increaseCount <- 0
		return
	}
	if reply.VoteGranted {
		// fmt.Println(rf.me,":",strings.Repeat(" ", rf.me*30),"Granted vote from", peer)
		increaseCount <- 1
	} else {
		// fmt.Println(rf.me,":",strings.Repeat(" ", rf.me*30),"Vote denied from",peer)
		increaseCount <- 0
		if args.Term < reply.Term {
			// fmt.Println(rf.me,":",strings.Repeat(" ", rf.me*30),"Another leader exists! Abort.",peer,"told me.")
			rf.mu.Lock()
			rf.state = Follower
			rf.currentTerm = reply.Term

			rf.mu.Unlock()
			return
		}
	}
}

func (rf *Raft) Candidate() {

	rf.mu.Lock()
	timeOut := randTimeout()
	me := rf.me
	term := rf.currentTerm
	peers := rf.peers
	lastLogIndex := rf.lastLogIndex
	lastLogTerm := rf.log[lastLogIndex].Term
	total := len(peers)
	majority := int(total/2 + 1) // 5/2 = 2.5 + 1 = int(3.5) = 3. Seems to work.

	// If exitForStatus receives 0, got timedout or outvoted, if 1, got enough votes to proceed
	exitForStatus := make(chan int, 2)
	// increaseCount: Send 0 when finished++, 1 when count++;finished++;. -1 will end the for loop
	increaseCount := make(chan int, total+1)
	// Both channels are used to avoid using Sleep. This way we use a system of interruption rather than consantly checking the value of all variables.
	rf.mu.Unlock()

	// majority, if total = 4, int(4/2 + 1) = 3, else if total = 5, int(5/2 + 1) = 3. Sounds about right.
	go AsyncTimeout(timeOut, exitForStatus)                         // This will send 0 to exitForStatus after sometime
	go rf.CountVotes(total, majority, exitForStatus, increaseCount) // This will send 1 to exitForStatus if it gets enough votes trough increaseCount
	for peer := range peers {
		if peer == me {
			increaseCount <- 1
			continue
		}
		args := RequestVoteArgs{}
		args.Term = term
		args.CandidateId = me
		args.LastLogIndex = lastLogIndex
		args.LastLogTerm = lastLogTerm
		go rf.awaitVotes(peer, args, increaseCount) // This will send 0 or 1 to increaseCount, where 0 means total++ and 1 means total++ and votes++
	}

	rf.mu.Lock()
	// Whichever funtion uses exitForStatus first is the correct answer. Late infos sent there will be ignored
	if <-exitForStatus == 1 && rf.state == Candidate { // Majority of votes. Leader
		rf.state = Leader
	} else { // Timedout or didn't get enough votes
		// corrida
		rf.state = Follower
	}
	rf.mu.Unlock()

	increaseCount <- -1 // Make sure CountVotes thread doesn't get stuck, trought eternity, suffering endlessly for its never answered question.
}

func (rf *Raft) Leader() {
	rf.mu.Lock()
	lastSeen := rf.lastSeen
	peers := rf.peers
	me := rf.me
	term := rf.currentTerm
	rf.mu.Unlock()

	// Sleep for sometime to avoid flooding network, but not too long that it may cause another election.
	sleepFor := time.Until(lastSeen.Add(time.Duration(minElectionTime/2) * time.Millisecond))
	if sleepFor > 0 {
		time.Sleep(sleepFor)
	}
	rf.mu.Lock()
	rf.lastSeen = time.Now() // Update to last heartbeat try
	rf.mu.Unlock()
	for peer := range peers {
		if peer == me {
			continue
		}

		go func(peer int) { // Send a ping/heartbeat
			args := AppendEntriesArgs{Term: term, LeaderId: me}
			reply := AppendEntriesReply{}
			ok := rf.sendAppendEntries(peer, &args, &reply)
			if !ok { // Logic required for log entries, but not for 2A
				return
			} else {
				rf.mu.Lock()
				if reply.Term > rf.currentTerm { // Another leader exists. Keep waiting for other responses tho.
					rf.currentTerm = args.Term
					rf.state = Follower
				}
				rf.mu.Unlock()
				return
			}
		}(peer)
	}
}

func (rf *Raft) ElectionLogic(local_batch int) {
	for {
		// corrida
		if local_batch < batch-1 { // Exits thread once more servers have been created. This is to prevent threads from existing forever
			return
		}
		state := rf.GetMachineState()
		if state == Follower {
			rf.Follower()
		} else if state == Candidate {
			rf.Candidate()
		} else if state == Leader {
			// corrida
			rf.Leader()
		}
	}
}

var peer_count = 0
var batch = 0

func Make(peers []*labrpc.ClientEnd, me int, persister *Persister, applyCh chan ApplyMsg) *Raft {
	rf := &Raft{}
	rf.peers = peers
	rf.persister = persister
	rf.me = me
	rf.applyCh = applyCh

	//%               -------------------                     %//
	// Initializing vars
	rf.state = Follower
	rf.log = []LogEntry{{Command: nil, Term: 0}}
	rf.votedFor = -1
	rf.nextIndex = make([]int, len(rf.peers))
	rf.matchIndex = make([]int, len(rf.peers))
	rf.lastSeen = time.Now()

	rf.readPersist(persister.ReadRaftState())

	// Initialize threads for controlling the logic of the states
	// corrida
	go rf.ElectionLogic(batch)

	//// Logic to avoid having threads stuck running
	//corrida
	peer_count++
	if peer_count == len(peers) {
		// CORRIDA
		batch++
		peer_count = 0
	}
	//////
	//%               -------------------                     %//

	return rf
}
