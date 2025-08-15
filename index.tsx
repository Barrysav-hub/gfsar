/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

interface Member {
  name: string;
  signInTime: Date | null;
  signOutTime: Date | null;
}

const PREDEFINED_MEMBERS = [
  'Andres Dean',
  'Barry Savitskoff',
  'Ben Peach',
  'Bill Sperling',
  'Brad Siemens',
  'Brennan Zorn',
  'Cavan Gates',
  'Chris Williams',
  'Christina Mavinic',
  'Clayton Marr',
  'Connie Bielert',
  'David Bryan',
  'Derek Pankoff',
  'Duke Enns',
  'Duncan Redfearn',
  'Erik Skaaning',
  'Erin Peach',
  'Graham Watt',
  'Grant Burnard',
  'Jackie Schott',
  'Jason Hall',
  'Jason Hugh',
  'Jennifer Erlendson',
  'John Wheeler',
  'John Younk',
  'Jon Wilson',
  'Justin Darbyshire',
  'Ken Lazeroff',
  'Kristina Anderson',
  'Madeline Williams',
  'Michael Slatnik',
  'Nathan Hein',
  'Nicky Winn',
  'Rebecca Massey',
  'Rocky Olsen',
  'Scott Lamont',
  'Skye Fletcher',
  'Spencer Novokshonoff',
  'Steve Danshin',
  'Trevor Carson',
  'Tyrell Polzin'
];

const App = () => {
  const [members, setMembers] = useState<Member[]>(() =>
    PREDEFINED_MEMBERS.map(name => ({ name, signInTime: null, signOutTime: null }))
      .sort((a, b) => a.name.localeCompare(b.name))
  );
  const [selectedMemberName, setSelectedMemberName] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [memberNameInput, setMemberNameInput] = useState('');
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [error, setError] = useState('');
  const [isListEditModalOpen, setIsListEditModalOpen] = useState(false);
  const [editingMemberList, setEditingMemberList] = useState<Member[]>([]);

  useEffect(() => {
    if (members.length > 0 && !selectedMemberName) {
      setSelectedMemberName(members[0].name);
    }
  }, [members, selectedMemberName]);

  const handleSignIn = (memberName: string) => {
    setMembers(members.map(member =>
      member.name === memberName ? { ...member, signInTime: new Date(), signOutTime: null } : member
    ));
  };

  const handleSignOut = (memberName: string) => {
    setMembers(members.map(member =>
      member.name === memberName ? { ...member, signOutTime: new Date() } : member
    ));
  };
  
  const formatDateTimeDisplay = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
  }

  const openModal = (mode: 'add' | 'edit', member?: Member) => {
    setModalMode(mode);
    setIsModalOpen(true);
    setError('');
    if (mode === 'edit' && member) {
        setMemberToEdit(member);
        setMemberNameInput(member.name);
    } else {
        setMemberNameInput('');
        setMemberToEdit(null);
    }
  };

  const closeModal = () => {
      setIsModalOpen(false);
      setModalMode(null);
      setMemberNameInput('');
      setError('');
      setMemberToEdit(null);
  };

  const handleSaveMember = () => {
    const trimmedName = memberNameInput.trim();
    if (!trimmedName) {
        setError('Member name cannot be empty.');
        return;
    }
    
    const isDuplicate = members.some(
      (member) => member.name.toLowerCase() === trimmedName.toLowerCase() && 
      (modalMode === 'add' || (modalMode === 'edit' && member.name !== memberToEdit?.name))
    );

    if (isDuplicate) {
        setError('A member with this name already exists.');
        return;
    }

    if (modalMode === 'add') {
        const newMember: Member = { name: trimmedName, signInTime: null, signOutTime: null };
        const updatedMembers = [...members, newMember].sort((a, b) => a.name.localeCompare(b.name));
        setMembers(updatedMembers);
        setSelectedMemberName(trimmedName);
    } else if (modalMode === 'edit' && memberToEdit) {
        const oldName = memberToEdit.name;
        const updatedMembers = members.map(member => 
            member.name === oldName ? { ...member, name: trimmedName } : member
        ).sort((a, b) => a.name.localeCompare(b.name));
        setMembers(updatedMembers);
        if (selectedMemberName === oldName) {
            setSelectedMemberName(trimmedName);
        }
    }
    closeModal();
  };

  const handleDeleteMember = () => {
    if (!memberToEdit) return;

    const isConfirmed = window.confirm(`Are you sure you want to delete ${memberToEdit.name}? This action cannot be undone.`);
    if (isConfirmed) {
      const updatedMembers = members.filter(m => m.name !== memberToEdit.name);
      setMembers(updatedMembers);
      if (selectedMemberName === memberToEdit.name) {
        setSelectedMemberName(updatedMembers.length > 0 ? updatedMembers[0].name : '');
      }
      closeModal();
    }
  };

  const openListEditModal = () => {
    setEditingMemberList([...members]);
    setIsListEditModalOpen(true);
  };

  const closeListEditModal = () => {
    setIsListEditModalOpen(false);
    setEditingMemberList([]);
  };

  const handleRemoveMemberFromEditList = (memberName: string) => {
    setEditingMemberList(currentList => currentList.filter(m => m.name !== memberName));
  };

  const handleSaveMemberList = () => {
    const updatedMembers = editingMemberList.map(member => ({
      ...members.find(m => m.name === member.name)!, // Keep existing times if possible
      name: member.name,
    })).sort((a, b) => a.name.localeCompare(b.name));
    
    setMembers(updatedMembers);
    if (!updatedMembers.some(m => m.name === selectedMemberName)) {
        setSelectedMemberName(updatedMembers.length > 0 ? updatedMembers[0].name : '');
    }
    closeListEditModal();
  };

  const selectedMember = members.find(m => m.name === selectedMemberName);
  const isSignInDisabled = !selectedMember || !!selectedMember.signInTime;
  const isSignOutDisabled = !selectedMember || !selectedMember.signInTime || !!selectedMember.signOutTime;
  
  const getLatestActivityTime = (member: Member) => {
    return Math.max(member.signInTime?.getTime() || 0, member.signOutTime?.getTime() || 0);
  };

  const attendanceLog = members
    .filter(m => m.signInTime)
    .sort((a, b) => getLatestActivityTime(b) - getLatestActivityTime(a));
  
  const handleExportAttendance = () => {
    if (attendanceLog.length === 0) return;
  
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const filenameDate = today.toISOString().slice(0, 10);
  
    let fileContent = `Grand Forks Search and Rescue - Attendance Log\n`;
    fileContent += `Date: ${dateString}\n\n`;
    fileContent += '---------------------------------\n\n';
  
    attendanceLog.forEach(member => {
      fileContent += `${member.name}\n`;
      const signIn = member.signInTime ? formatDateTimeDisplay(member.signInTime) : 'N/A';
      const signOut = member.signOutTime ? formatDateTimeDisplay(member.signOutTime) : 'Not yet signed out';
      fileContent += `  Sign In:  ${signIn}\n`;
      fileContent += `  Sign Out: ${signOut}\n\n`;
    });
    
    fileContent += '---------------------------------\n';
  
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_log_${filenameDate}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-container">
      <header>
        <h1>Grand Forks Search and Rescue</h1>
      </header>

      <main className="main-content">
        <section className="member-list-section" aria-labelledby="member-list-heading">
          <div className="list-header">
            <h2 id="member-list-heading">Member Sign-In</h2>
            <div className="header-actions">
               <button onClick={openListEditModal} className="edit-list-btn" aria-label="Edit entire member list">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                </svg>
              </button>
              <button onClick={() => openModal('add')} className="add-member-btn" aria-label="Add new member">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="attendance-controls">
            {members.length > 0 ? (
              <>
                <div className="select-and-edit">
                    <div className="select-container">
                        <label htmlFor="member-select" className="sr-only">Select Member</label>
                        <select
                            id="member-select"
                            className="member-select"
                            value={selectedMemberName}
                            onChange={e => setSelectedMemberName(e.target.value)}
                        >
                        {members.map(member => (
                            <option key={member.name} value={member.name}>
                                {member.name}
                            </option>
                        ))}
                        </select>
                    </div>
                     <button onClick={() => openModal('edit', selectedMember)} className="edit-selected-btn" aria-label="Edit selected member" disabled={!selectedMember}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                </div>
                <div className="info-and-actions">
                    <div className="timestamps">
                        {selectedMember?.signInTime && <span className="timestamp">In: {formatDateTimeDisplay(selectedMember.signInTime)}</span>}
                        {selectedMember?.signOutTime && <span className="timestamp">Out: {formatDateTimeDisplay(selectedMember.signOutTime)}</span>}
                    </div>
                    <div className="action-buttons">
                        <button onClick={() => handleSignIn(selectedMemberName)} disabled={isSignInDisabled} className="signin-btn">Sign In</button>
                        <button onClick={() => handleSignOut(selectedMemberName)} disabled={isSignOutDisabled} className="signout-btn">Sign Out</button>
                    </div>
                </div>
              </>
            ) : (
              <p className="empty-state">No members on the list. Click the plus icon to add one.</p>
            )}
          </div>
        </section>

        <section className="attendance-log-section" aria-labelledby="attendance-log-heading">
            <div className="list-header">
              <h2 id="attendance-log-heading">Today's Attendance</h2>
              <div className="header-actions">
                  <button 
                    onClick={handleExportAttendance} 
                    className="export-btn" 
                    disabled={attendanceLog.length === 0} 
                    aria-label="Export today's attendance log as a text file"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                      <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                    </svg>
                  </button>
              </div>
            </div>
            <div className="attendance-list">
            {attendanceLog.length > 0 ? (
                attendanceLog.map(member => (
                    <article key={member.name} className="attendance-list-item" aria-label={`Attendance for ${member.name}`}>
                        <span className="member-name">{member.name}</span>
                        <div className="timestamps-log">
                            {member.signInTime && <span className="timestamp">In: {formatDateTimeDisplay(member.signInTime)}</span>}
                            {member.signOutTime && <span className="timestamp">Out: {formatDateTimeDisplay(member.signOutTime)}</span>}
                        </div>
                    </article>
                ))
            ) : (
                <p className="empty-state">No attendance records yet.</p>
            )}
            </div>
        </section>

      </main>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 id="modal-title">{modalMode === 'add' ? 'Add New Member' : 'Edit Member Name'}</h3>
            <div className="form-group">
              <label htmlFor="memberNameInput">Member Name</label>
              <input
                type="text"
                id="memberNameInput"
                className="modal-input"
                value={memberNameInput}
                onChange={(e) => setMemberNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveMember()}
                autoFocus
              />
              {error && <p className="error-message">{error}</p>}
            </div>
            <div className="modal-actions">
              {modalMode === 'edit' && (
                <button onClick={handleDeleteMember} className="delete-btn">Delete Member</button>
              )}
              <button onClick={closeModal} className="cancel-btn">Cancel</button>
              <button onClick={handleSaveMember} className="save-btn">Save</button>
            </div>
          </div>
        </div>
      )}

      {isListEditModalOpen && (
        <div className="modal-overlay" onClick={closeListEditModal} role="dialog" aria-modal="true" aria-labelledby="list-modal-title">
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 id="list-modal-title">Edit Member List</h3>
            <p className="modal-instructions">Remove members from the list. This will permanently remove them from the roster.</p>
            
            <div className="modal-member-list-container">
              {editingMemberList.length > 0 ? (
                <ul className="modal-member-list">
                  {editingMemberList.map(member => (
                    <li key={member.name} className="modal-member-item">
                      <span>{member.name}</span>
                      <button onClick={() => handleRemoveMemberFromEditList(member.name)} className="modal-member-delete-btn" aria-label={`Remove ${member.name}`}>
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                           <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                           <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                         </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : <p className="empty-state-modal">No members to display.</p>}
            </div>

            <div className="modal-actions">
              <button onClick={closeListEditModal} className="cancel-btn">Cancel</button>
              <button onClick={handleSaveMemberList} className="save-btn">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<React.StrictMode><App /></React.StrictMode>);