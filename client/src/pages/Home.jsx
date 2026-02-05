import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div>
            <div className="nav">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'var(--primary)', fontSize: '24px' }}>VAULT</span>
                    <span style={{ fontWeight: 400, fontSize: '16px', color: 'var(--text-light)' }}>Free Draft Services</span>
                </div>
            </div>

            <div style={{ textAlign: 'center', padding: '100px 20px' }} className="hero">
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', fontWeight: 800 }}>
                    Get Your Draft <span style={{ color: 'var(--primary)' }}>Now</span>
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '3rem' }}>
                    Professional, automated legal drafts in seconds.
                </p>
                
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '30px',
                    flexWrap: 'wrap'
                }} className="cards">
                    <div
                        className="card glass-panel"
                        style={{
                            width: '280px',
                            padding: '40px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '15px'
                        }}
                        onClick={() => navigate('/mou')}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.borderColor = 'var(--primary)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'transparent';
                        }}
                    >
                        <div style={{ 
                            width: '60px', 
                            height: '60px', 
                            background: 'var(--primary-light)', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: 'var(--primary)',
                            fontSize: '24px',
                            fontWeight: 'bold'
                        }}>
                            📄
                        </div>
                        <h3 style={{ margin: 0 }}>MOU Draft</h3>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Memorandum of Understanding</p>
                        <button className="btn btn-primary" style={{ marginTop: '10px', width: '100%' }}>Create Draft</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
