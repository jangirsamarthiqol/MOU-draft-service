import React, { useState } from 'react';
import { X, Download } from 'lucide-react';

const UserDetailsModal = ({ isOpen, onClose, onSubmit, title = "Download Document" }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim()) {
            setError('Please fill in all fields');
            return;
        }
        onSubmit({ name, phone });
        // Reset form or keep it filled? usually reset on successful close/submit handled by parent
        setError(''); 
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div className="glass-panel" style={{
                background: 'white',
                width: '100%',
                maxWidth: '400px',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                position: 'relative',
                border: '1px solid rgba(255, 255, 255, 0.8)'
            }}>
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-light)',
                        padding: '4px'
                    }}
                >
                    <X size={20} />
                </button>

                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: 'var(--text-main)' }}>
                    Details Required
                </h3>
                <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    Please enter your details to download the <b>{title}</b>.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Full Name <span style={{color:'red'}}>*</span></label>
                        <input 
                            className="input-field" 
                            placeholder="John Doe" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Phone Number <span style={{color:'red'}}>*</span></label>
                        <input 
                            className="input-field" 
                            placeholder="+91 98765 43210" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="btn btn-secondary" 
                            style={{ flex: 1 }}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            style={{ flex: 1 }}
                        >
                            <Download size={18} /> Download
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserDetailsModal;
