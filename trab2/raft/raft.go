package raft

import (
	"bytes"
	"encoding/gob"
	"labrpc"
	"math/rand"
	"sync"
	"time"
)

// Estados //
const (
	StateFollower = iota
	StateCandidate
	StateLeader
)

const (
	DefaultElectionTimeoutMin   = 150
	DefaultElectionTimeoutMax   = 350
	DefaultElectionTimeoutRange = DefaultElectionTimeoutMax - DefaultElectionTimeoutMin
	DefaultHeartbeatInterval    = 100 * time.Millisecond
	DefaultChannelBufferSize    = 20
)

type ApplyMsg struct {
	Index       int
	Command     interface{}
	UseSnapshot bool
	Snapshot    []byte
}

type LogEntry struct {
	Term    int
	Command interface{}
}

type Raft struct {
	mu        sync.Mutex
	peers     []*labrpc.ClientEnd
	persister *Persister
	me        int

	state              int
	votes              int
	requestVoteReplied chan bool
	winner             chan bool
	appendEntriesRec   chan bool
	commandApplied     chan ApplyMsg

	currentTerm int
	votedFor    int
	log         []LogEntry

	commitIndex int
	lastApplied int
	nextIndex   []int
	matchIndex  []int
}

type RequestVoteArgs struct {
	Term         int
	CandidateId  int
	LastLogIndex int
	LastLogTerm  int
}

type RequestVoteReply struct {
	Term        int
	VoteGranted bool
}

type AppendEntriesArgs struct {
	Term         int
	LeaderId     int
	PrevLogIndex int
	PrevLogTerm  int
	Entries      []LogEntry // vazio para heartbeat
	LeaderCommit int
}

type AppendEntriesReply struct {
	Term          int
	Success       bool
	ConflictIndex int // se houver erro, avisar lider do index do conflito
	ConflictTerm  int // se houver erro, avisar o lider o termo no log do ConflictIndex
}

func (rf *Raft) GetState() (int, bool) {
	var term int
	var isLeader bool
	rf.mu.Lock()
	defer rf.mu.Unlock()

	term = rf.currentTerm
	isLeader = rf.state == StateLeader

	return term, isLeader
}

func (rf *Raft) persist() {
	w := new(bytes.Buffer)
	e := gob.NewEncoder(w)
	e.Encode(rf.currentTerm)
	e.Encode(rf.votedFor)
	e.Encode(rf.log)
	data := w.Bytes()
	rf.persister.SaveRaftState(data)
}

func (rf *Raft) readPersist(data []byte) {
	r := bytes.NewBuffer(data)
	d := gob.NewDecoder(r)
	d.Decode(&rf.currentTerm)
	d.Decode(&rf.votedFor)
	d.Decode(&rf.log)
}

func (rf *Raft) GetLastEntryIndex() int {
	return len(rf.log) - 1
}

func (rf *Raft) GetLastEntryTerm() int {
	return rf.log[len(rf.log)-1].Term
}

func (rf *Raft) RequestVote(args RequestVoteArgs, reply *RequestVoteReply) {
	rf.mu.Lock()
	defer rf.mu.Unlock()
	defer rf.persist()

	reply.Term = rf.currentTerm
	reply.VoteGranted = false

	// Retorna falso quando o termo for menor do que o termo do atual
	if args.Term < rf.currentTerm {
		return
	}

	// Se a requisicao ou resposta RPC possuir um termo maior que o termo atual, então o currentTerm = T e vira seguidor
	if args.Term > rf.currentTerm {
		rf.currentTerm = args.Term
		rf.state = StateFollower
		rf.votedFor = -1
	}

	// Se o candidato tem um log mais atualizado, entao votar no candidato
	if (rf.votedFor == -1 || rf.votedFor == args.CandidateId) &&
		(args.LastLogTerm > rf.GetLastEntryTerm() ||
			(args.LastLogTerm == rf.GetLastEntryTerm() && args.LastLogIndex >= rf.GetLastEntryIndex())) {
		rf.votedFor = args.CandidateId
		reply.VoteGranted = true
		rf.requestVoteReplied <- true
	}
}

func (rf *Raft) sendRequestVote(server int, args RequestVoteArgs, reply *RequestVoteReply) bool {
	ok := rf.peers[server].Call("Raft.RequestVote", args, reply)
	rf.mu.Lock()
	defer rf.mu.Unlock()
	defer rf.persist()

	if ok && reply.Term > rf.currentTerm {
		rf.currentTerm = reply.Term
		rf.state = StateFollower
		rf.votedFor = -1
		rf.persist()
	}
	if ok && rf.state == StateCandidate && reply.VoteGranted {
		rf.votes++
		if rf.votes > len(rf.peers)/2 {
			rf.winner <- true
		}
	}

	return ok
}

func (rf *Raft) AppendEntries(args AppendEntriesArgs, reply *AppendEntriesReply) {
	rf.mu.Lock()
	defer rf.mu.Unlock()
	defer rf.persist()

	reply.Term = rf.currentTerm
	reply.Success = false

	// Retornar falso se o termo for menor que o termo atual //
	if args.Term < rf.currentTerm {
		return
	}

	rf.appendEntriesRec <- true

	// Se a requisicao ou resposta RPC possuir um termo maior que o termo atual, então o currentTerm = T e vira seguidor
	if args.Term > rf.currentTerm {
		rf.currentTerm = args.Term
		rf.state = StateFollower
		rf.votedFor = -1
	}

	reply.Term = args.Term

	// Retorna falso se o log nao contem uma entrada prevLogIndex que bate com o termo //
	if rf.GetLastEntryIndex() < args.PrevLogIndex || rf.log[args.PrevLogIndex].Term != args.PrevLogTerm {
		reply.ConflictIndex = max(args.PrevLogIndex, len(rf.log))
		reply.ConflictTerm = -1
		if reply.ConflictIndex < len(rf.log) {
			reply.ConflictTerm = rf.log[reply.ConflictIndex].Term
		}
		return
	}

	rf.log = append(rf.log[:args.PrevLogIndex+1], args.Entries...)

	if args.LeaderCommit > rf.commitIndex {
		rf.commitIndex = min(args.LeaderCommit, rf.GetLastEntryIndex())
		for i := rf.lastApplied + 1; i <= rf.commitIndex; i++ {
			rf.commandApplied <- ApplyMsg{Index: i, Command: rf.log[i].Command}
		}
		rf.lastApplied = rf.commitIndex
	}

	reply.Success = true
}

func (rf *Raft) sendAppendEntries(server int, args AppendEntriesArgs, reply *AppendEntriesReply) bool {
	ok := rf.peers[server].Call("Raft.AppendEntries", args, reply)
	rf.mu.Lock()
	defer rf.mu.Unlock()

	if !ok || reply.Term <= rf.currentTerm {
		return ok
	}

	rf.currentTerm = reply.Term
	rf.state = StateFollower
	rf.votedFor = -1
	rf.persist()

	if rf.state != StateLeader {
		return ok
	}

	if reply.Success {
		rf.updateIndexesAndCommit(server)
	} else {
		rf.handleLogInconsistency(server, reply)
	}

	return ok
}

func (rf *Raft) updateIndexesAndCommit(server int) {
	rf.nextIndex[server] = rf.GetLastEntryIndex() + 1
	rf.matchIndex[server] = rf.GetLastEntryIndex()

	for N := rf.commitIndex + 1; N < len(rf.log); N++ {
		if rf.updateCommitIndex(N) {
			break
		}
	}

	for i := rf.lastApplied + 1; i <= rf.commitIndex; i++ {
		msg := ApplyMsg{
			Index:   i,
			Command: rf.log[i].Command,
		}
		rf.commandApplied <- msg
	}
	rf.lastApplied = rf.commitIndex
}

func (rf *Raft) updateCommitIndex(N int) bool {
	count := 1
	for _, v := range rf.matchIndex {
		if v >= N {
			count++
		}
		if count > len(rf.peers)/2 && rf.log[N].Term == rf.currentTerm {
			rf.commitIndex = N
			return true
		}
	}
	return false
}

func (rf *Raft) handleLogInconsistency(server int, reply *AppendEntriesReply) {
	if reply.ConflictTerm == -1 {
		rf.nextIndex[server] = reply.ConflictIndex
	} else {
		rf.updateNextIndex(server, reply)
	}
}

func (rf *Raft) updateNextIndex(server int, reply *AppendEntriesReply) {
	for i := len(rf.log) - 1; i >= 0; i-- {
		if rf.log[i].Term == reply.ConflictTerm {
			rf.nextIndex[server] = i + 1
			return
		}
	}
	rf.nextIndex[server] = reply.ConflictIndex
}

func (rf *Raft) doAsFollower() {
	electionTimeout := rand.Intn(DefaultElectionTimeoutRange) + DefaultElectionTimeoutMin
	timeout := time.After(time.Duration(electionTimeout) * time.Millisecond)

	select {
	case <-timeout:
		rf.mu.Lock() // acquire write lock
		rf.state = StateCandidate
		rf.mu.Unlock() // release write lock
	case <-rf.requestVoteReplied:
	case <-rf.appendEntriesRec:
	}
}

func (rf *Raft) doAsCandidate() {
	rf.mu.Lock()
	rf.currentTerm++
	rf.votedFor = rf.me
	rf.votes = 1
	rf.persist()
	rf.mu.Unlock()

	// Envia RPCs de RequestVote para todos os outros nós //
	go rf.sendVoteRequests()

	electionTimeout := rand.Intn(DefaultElectionTimeoutRange) + DefaultElectionTimeoutMin
	select {
	case <-rf.winner: // Se torna líder
		rf.becomeLeader()
	case <-rf.appendEntriesRec: // Se receber algo no canal appendEntriesRec, tem um novo líder e se torna seguidor
		rf.state = StateFollower
	case <-time.After(time.Duration(electionTimeout) * time.Millisecond): // O tempo de eleição expirou, o que iniciará uma nova eleição
	}
}

func (rf *Raft) sendVoteRequests() {
	var args RequestVoteArgs
	rf.mu.Lock()
	args.Term = rf.currentTerm
	args.CandidateId = rf.me
	args.LastLogTerm = rf.GetLastEntryTerm()
	args.LastLogIndex = rf.GetLastEntryIndex()
	rf.mu.Unlock()
	for i := range rf.peers {
		if i != rf.me {
			var reply RequestVoteReply
			go rf.sendRequestVote(i, args, &reply)
		}
	}
}

func (rf *Raft) becomeLeader() {
	rf.mu.Lock()
	rf.state = StateLeader
	rf.nextIndex = make([]int, len(rf.peers))
	rf.matchIndex = make([]int, len(rf.peers))
	for i := 0; i < len(rf.peers); i++ {
		rf.nextIndex[i] = rf.GetLastEntryIndex() + 1
		rf.matchIndex[i] = 0
	}
	rf.mu.Unlock()
}

func (rf *Raft) doAsLeader() {
	for i := range rf.peers {
		if i != rf.me {
			go rf.sendEntriesToPeer(i)
		}
	}

	// Envia heartbeats periodicamente //
	time.Sleep(DefaultHeartbeatInterval)
}

func (rf *Raft) sendEntriesToPeer(i int) {
	rf.mu.Lock()
	args := AppendEntriesArgs{
		Term:         rf.currentTerm,
		LeaderId:     rf.me,
		PrevLogIndex: rf.nextIndex[i] - 1,
		PrevLogTerm:  rf.log[rf.nextIndex[i]-1].Term,
		Entries:      append([]LogEntry{}, rf.log[rf.nextIndex[i]:]...),
		LeaderCommit: rf.commitIndex,
	}
	rf.mu.Unlock()

	var reply AppendEntriesReply
	go rf.sendAppendEntries(i, args, &reply)
}

func (rf *Raft) stateLoop() {
	for {
		rf.mu.Lock()
		state := rf.state
		rf.mu.Unlock()
		switch state {
		case StateFollower:
			rf.doAsFollower()
		case StateCandidate:
			rf.doAsCandidate()
		case StateLeader:
			rf.doAsLeader()
		}
	}
}

func (rf *Raft) Start(command interface{}) (int, int, bool) {
	index := -1
	term := -1
	isLeader := rf.state == StateLeader
	if isLeader {
		rf.mu.Lock()
		// Anexar entrada ao log local //
		rf.log = append(rf.log, LogEntry{
			Term:    rf.currentTerm,
			Command: command,
		})
		rf.persist()
		index = rf.GetLastEntryIndex()
		term = rf.currentTerm
		rf.mu.Unlock()
	}
	return index, term, isLeader
}

func (rf *Raft) Kill() {
	// Your code here, if desired.
}

func Make(peers []*labrpc.ClientEnd, me int, persister *Persister, applyCh chan ApplyMsg) *Raft {
	rf := &Raft{
		peers:              peers,
		persister:          persister,
		me:                 me,
		state:              StateFollower,
		currentTerm:        0,
		votedFor:           -1,
		votes:              0,
		appendEntriesRec:   make(chan bool, DefaultChannelBufferSize),
		requestVoteReplied: make(chan bool, DefaultChannelBufferSize),
		winner:             make(chan bool, DefaultChannelBufferSize),
		commandApplied:     applyCh,
		log:                []LogEntry{{Term: 0, Command: -1}},
		commitIndex:        0,
		lastApplied:        0,
	}
	rand.Seed(time.Now().UnixNano() + int64(rf.me))
	go rf.stateLoop()

	rf.readPersist(persister.ReadRaftState())

	return rf
}
