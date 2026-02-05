import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div>
            <div className="nav">
                <div>VAULT – free draft services</div>
            </div>

            <div style={{ textAlign: 'center', padding: '80px 20px' }} className="hero">
                <h1 style={{ fontSize: '48px', marginBottom: '10px' }}>
                    Get Your Draft <span style={{ color: '#3557f2' }}>Now</span>
                </h1>
                <p>Click below to create your draft</p>
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '30px',
                marginTop: '40px',
                flexWrap: 'wrap'
            }} className="cards">
                <div
                    style={{
                        background: 'white',
                        width: '260px',
                        padding: '30px',
                        borderRadius: '12px',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'transform 0.2s'
                    }}
                    onClick={() => navigate('/mou')}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <h3>MOU Draft</h3>
                    <p>Memorandum of Understanding</p>
                </div>
            </div>
        </div>
    );
};

export default Home;
