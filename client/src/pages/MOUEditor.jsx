import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { 
    Download, 
    FileText, 
    Users, 
    UserPlus, 
    Trash2, 
    ChevronDown, 
    ChevronUp, 
    CreditCard, 
    Calendar,
    MapPin,
    Building,
    FileType
} from 'lucide-react';

import UserDetailsModal from '../components/UserDetailsModal';

const numberToWords = (num) => {
    if (!num) return '';
    const a = ['','One ','Two ','Three ','Four ','Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
    const b = ['', '', 'Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    
    const unformattedNum = num.toString().replace(/,/g, '');
    if (isNaN(unformattedNum)) return num;
    
    const n = ('000000000' + unformattedNum).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    
    return str.trim() + ' Only';
};

const dateToWords = (dateString) => {
    // Try to parse "25th January 2026" or "2026-01-25"
    // This is a basic converter, assuming user input is somewhat standard or uses the date input
    if(!dateString) return '';
    const date = new Date(dateString);
    if(isNaN(date.getTime())) return dateString; // Return original if parse fails

    const day = date.getDate();
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' });
    
    const numToWordMap = ['','First','Second','Third','Fourth','Fifth','Sixth','Seventh','Eighth','Ninth','Tenth','Eleventh','Twelfth','Thirteenth','Fourteenth','Fifteenth','Sixteenth','Seventeenth','Eighteenth','Nineteenth','Twentieth','Twenty First','Twenty Second','Twenty Third','Twenty Fourth','Twenty Fifth','Twenty Sixth','Twenty Seventh','Twenty Eighth','Twenty Ninth','Thirtieth','Thirty First'];
    const dayWord = numToWordMap[day] || day;
    
    // Year to words (Simple approach: Twenty Twenty Six)
    const y1 = Math.floor(year / 100);
    const y2 = year % 100;
    const yearWord = numberToWords(y1).replace(' Only','') + ' ' + numberToWords(y2).replace(' Only','');

    return `${dayWord} of ${month} ${yearWord}`;
};

const MOUEditor = () => {
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [downloadType, setDownloadType] = useState(null);
    const [expandedSection, setExpandedSection] = useState('general');
    const [mobileView, setMobileView] = useState('form'); // 'form' or 'preview'
    const [formData, setFormData] = useState({
        agreementDate: '2026-01-25',
        place: 'Bangalore',
        sellers: [
            { title: 'Mr.', name: '', fatherName: '', age: '', address: '', aadhar: '', pan: '' }
        ],
        buyers: [
            { title: 'Mr.', name: '', fatherName: '', age: '', address: '', aadhar: '', pan: '' }
        ],
        property: {
            scheduleA: '',
            scheduleB: '',
            scheduleC: '',
        },
        financials: {
            totalConsideration: '',
            tokenAdvance1: { amount: '', date: '', dateText: '', method: 'UPI', txnId: '' },
            tokenAdvance2: { amount: '', date: '', dateText: '', method: 'Bank Transfer', txnId: '' },
            signingAmount: '', 
            agreementSaleAmount: '', 
            agreementSaleDateText: '',
            balanceAmount: '', 
            cancellationCharge: '5,00,000'
        }
    });

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const handleChange = (section, field, value, index = null, subField = null) => {
        const newData = { ...formData };
        if (section === 'root') {
            newData[field] = value;
        } else if (Array.isArray(newData[section])) {
            newData[section][index][field] = value;
        } else if (subField) {
            newData[section][field][subField] = value;
        } else {
            newData[section][field] = value;
        }
        setFormData(newData);
    };

    const addParty = (type) => {
        const newParty = { title: 'Mr.', name: '', fatherName: '', age: '', address: '', aadhar: '', pan: '' };
        setFormData({ ...formData, [type]: [...formData[type], newParty] });
    };

    const removeParty = (type, index) => {
        const list = [...formData[type]];
        list.splice(index, 1);
        setFormData({ ...formData, [type]: list });
    };

    const downloadPDF = async (userName, userPhone) => {
        if (!userName || !userPhone) return;


        setLoading(true);
        try {
            await axios.post('/api/save-user', {
                name: userName,
                phone: userPhone,
                date: new Date().toISOString(),
                role: 'User'
            });
        } catch (err) {
            console.error("Failed to save user data", err);
        }

        const element = document.getElementById('mou-preview');
        const opt = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: 'MOU_Draft.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => setLoading(false));
    };

    const downloadDOCX = async (userName, userPhone) => {
        if (!userName || !userPhone) return;


        setLoading(true);
        try {
            await axios.post('/api/save-user', {
                name: userName,
                phone: userPhone,
                date: new Date().toISOString(),
                role: 'User'
            });
        } catch (err) {
            console.error("Failed to save user data", err);
        }

        const content = document.getElementById('mou-preview').innerHTML;
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; }
                    p { text-align: justify; }
                    .center { text-align: center; }
                    .bold { font-weight: bold; }
                    .underline { text-decoration: underline; }
                </style>
            </head>
            <body>${content}</body>
            </html>
        `;

        // @ts-ignore
        if (window.htmlDocx) {
            const converted = window.htmlDocx.asBlob(html);
            saveAs(converted, 'MOU_Draft.docx');
        } else {
            alert("DOCX conversion library not loaded.");
        }
        setLoading(false);
    };

    const handleDownloadRequest = (type) => {
        setDownloadType(type);
        setModalOpen(true);
        if (window.clarity) {
            window.clarity("event", `download_initiated_${type.toLowerCase()}`);
        }
    };

    const handleModalSubmit = async ({ name, phone }) => {
        setModalOpen(false);
        if (window.clarity) {
            window.clarity("event", `download_completed_${downloadType ? downloadType.toLowerCase() : 'unknown'}`);
        }
        if (downloadType === 'PDF') {
            await downloadPDF(name, phone);
        } else {
            await downloadDOCX(name, phone);
        }
    };

    const handleModalClose = () => {
        setModalOpen(false);
        if (window.clarity) {
            window.clarity("event", `download_skipped_${downloadType ? downloadType.toLowerCase() : 'unknown'}`);
        }
    };


    const AccordionHeader = ({ title, icon: Icon, section }) => (
        <div 
            onClick={() => toggleSection(section)}
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '1rem',
                cursor: 'pointer',
                background: expandedSection === section ? 'var(--primary-light)' : 'white',
                borderBottom: '1px solid var(--border-light)',
                color: expandedSection === section ? 'var(--primary-dark)' : 'var(--text-main)',
                transition: 'background 0.2s'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                {Icon && <Icon size={18} />}
                {title}
            </div>
            {expandedSection === section ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
    );

    return (
        <div className="editor-container">
            {/* Left Sidebar: Form */}
            <div className={`editor-sidebar ${mobileView !== 'form' ? 'hidden-mobile' : ''}`}>
                <div className="editor-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', background: 'white' }}>
                    <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <FileText className="text-primary" /> Editor
                    </h2>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Fill in the details to generate your MOU.
                    </p>
                </div>

                <div style={{ flex: 1 }}>
                    {/* General Section */}
                    <AccordionHeader title="General Details" icon={Calendar} section="general" />
                    {expandedSection === 'general' && (
                        <div className="accordion-content" style={{ padding: '1.5rem', background: 'white' }}>
                            <div className="input-group">
                                <label className="input-label">test Agreement Date</label>
                                <input className="input-field" placeholder="e.g. 25th January 2026" value={formData.agreementDate} onChange={(e) => handleChange('root', 'agreementDate', e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Place of Execution</label>
                                <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                    <MapPin size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-light)' }} />
                                    <input className="input-field" style={{ paddingLeft: '35px' }} placeholder="e.g. Bangalore" value={formData.place} onChange={(e) => handleChange('root', 'place', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sellers Section */}
                    <AccordionHeader title="Sellers (First Party)" icon={Users} section="sellers" />
                    {expandedSection === 'sellers' && (
                        <div style={{ padding: '1.5rem', background: 'white' }}>
                            {formData.sellers.map((seller, i) => (
                                <div key={i} className="card" style={{ padding: '1rem', position: 'relative' }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--primary)' }}>Seller {i + 1}</h4>
                                    <button onClick={() => removeParty('sellers', i)} className="btn-icon" style={{ position: 'absolute', top: '10px', right: '10px', color: '#ef4444', background: '#fee2e2' }}>
                                        <Trash2 size={14} />
                                    </button>
                                    
                                    <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
                                        <select className="input-field" value={seller.title} onChange={(e) => handleChange('sellers', 'title', e.target.value, i)}>
                                            <option value="Mr.">Mr.</option>
                                            <option value="Ms.">Ms.</option>
                                            <option value="Mrs.">Mrs.</option>
                                            <option value="M/s.">M/s.</option>
                                        </select>
                                        <input className="input-field" placeholder="Full Name" value={seller.name} onChange={(e) => handleChange('sellers', 'name', e.target.value, i)} />
                                    </div>
                                    <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '10px' }}>
                                        <input className="input-field" placeholder="Father's Name" value={seller.fatherName} onChange={(e) => handleChange('sellers', 'fatherName', e.target.value, i)} />
                                        <input className="input-field" placeholder="Age" value={seller.age} onChange={(e) => handleChange('sellers', 'age', e.target.value, i)} />
                                    </div>
                                    <div className="input-group">
                                        <textarea className="input-field" placeholder="Address" rows="2" value={seller.address} onChange={(e) => handleChange('sellers', 'address', e.target.value, i)} />
                                    </div>
                                    <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <input className="input-field" placeholder="Aadhar No." value={seller.aadhar} onChange={(e) => handleChange('sellers', 'aadhar', e.target.value, i)} />
                                        <input className="input-field" placeholder="PAN No." value={seller.pan} onChange={(e) => handleChange('sellers', 'pan', e.target.value, i)} />
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => addParty('sellers')} className="btn btn-secondary" style={{ width: '100%' }}>
                                <UserPlus size={16} /> Add Another Seller
                            </button>
                        </div>
                    )}

                    {/* Buyers Section */}
                    <AccordionHeader title="Buyers (Second Party)" icon={Users} section="buyers" />
                    {expandedSection === 'buyers' && (
                        <div style={{ padding: '1.5rem', background: 'white' }}>
                            {formData.buyers.map((buyer, i) => (
                                <div key={i} className="card" style={{ padding: '1rem', position: 'relative' }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--primary)' }}>Buyer {i + 1}</h4>
                                    <button onClick={() => removeParty('buyers', i)} className="btn-icon" style={{ position: 'absolute', top: '10px', right: '10px', color: '#ef4444', background: '#fee2e2' }}>
                                        <Trash2 size={14} />
                                    </button>
                                    
                                    <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
                                        <select className="input-field" value={buyer.title} onChange={(e) => handleChange('buyers', 'title', e.target.value, i)}>
                                            <option value="Mr.">Mr.</option>
                                            <option value="Ms.">Ms.</option>
                                            <option value="Mrs.">Mrs.</option>
                                            <option value="M/s.">M/s.</option>
                                        </select>
                                        <input className="input-field" placeholder="Full Name" value={buyer.name} onChange={(e) => handleChange('buyers', 'name', e.target.value, i)} />
                                    </div>
                                    <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '10px' }}>
                                        <input className="input-field" placeholder="Father/Husband Name" value={buyer.fatherName} onChange={(e) => handleChange('buyers', 'fatherName', e.target.value, i)} />
                                        <input className="input-field" placeholder="Age" value={buyer.age} onChange={(e) => handleChange('buyers', 'age', e.target.value, i)} />
                                    </div>
                                    <div className="input-group">
                                        <textarea className="input-field" placeholder="Address" rows="2" value={buyer.address} onChange={(e) => handleChange('buyers', 'address', e.target.value, i)} />
                                    </div>
                                    <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <input className="input-field" placeholder="Aadhar No." value={buyer.aadhar} onChange={(e) => handleChange('buyers', 'aadhar', e.target.value, i)} />
                                        <input className="input-field" placeholder="PAN No." value={buyer.pan} onChange={(e) => handleChange('buyers', 'pan', e.target.value, i)} />
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => addParty('buyers')} className="btn btn-secondary" style={{ width: '100%' }}>
                                <UserPlus size={16} /> Add Another Buyer
                            </button>
                        </div>
                    )}

                    {/* Financials Section */}
                    <AccordionHeader title="Financials" icon={CreditCard} section="financials" />
                    {expandedSection === 'financials' && (
                        <div style={{ padding: '1.5rem', background: 'white' }}>
                            <div className="input-group">
                                <label className="input-label">Total Consideration (Rs.)</label>
                                <input className="input-field" placeholder="e.g. 2,27,00,000" value={formData.financials.totalConsideration} onChange={(e) => handleChange('financials', 'totalConsideration', e.target.value)} />
                            </div>
                            
                            <h4 style={{ fontSize: '0.9rem', margin: '1.5rem 0 0.5rem', color: 'var(--text-muted)' }}>Token Advance 1</h4>
                            <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <input className="input-field" placeholder="Amount" value={formData.financials.tokenAdvance1.amount} onChange={(e) => handleChange('financials', 'tokenAdvance1', e.target.value, null, 'amount')} />
                                <input className="input-field" placeholder="Date (e.g. 18th Jan)" value={formData.financials.tokenAdvance1.dateText} onChange={(e) => handleChange('financials', 'tokenAdvance1', e.target.value, null, 'dateText')} />
                            </div>
                            <div className="input-group">
                                <input className="input-field" placeholder="Transaction ID / Details" value={formData.financials.tokenAdvance1.txnId} onChange={(e) => handleChange('financials', 'tokenAdvance1', e.target.value, null, 'txnId')} />
                            </div>

                            <h4 style={{ fontSize: '0.9rem', margin: '1.5rem 0 0.5rem', color: 'var(--text-muted)' }}>Token Advance 2</h4>
                            <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <input className="input-field" placeholder="Amount" value={formData.financials.tokenAdvance2.amount} onChange={(e) => handleChange('financials', 'tokenAdvance2', e.target.value, null, 'amount')} />
                                <input className="input-field" placeholder="Date (e.g. 19th Jan)" value={formData.financials.tokenAdvance2.dateText} onChange={(e) => handleChange('financials', 'tokenAdvance2', e.target.value, null, 'dateText')} />
                            </div>
                            <div className="input-group">
                                <input className="input-field" placeholder="Transaction ID / Details" value={formData.financials.tokenAdvance2.txnId} onChange={(e) => handleChange('financials', 'tokenAdvance2', e.target.value, null, 'txnId')} />
                            </div>

                            <h4 style={{ fontSize: '0.9rem', margin: '1.5rem 0 0.5rem', color: 'var(--text-muted)' }}>Milestone Payments</h4>
                            <div className="input-group">
                                <label className="input-label">At MOU Signing</label>
                                <input className="input-field" placeholder="Amount" value={formData.financials.signingAmount} onChange={(e) => handleChange('financials', 'signingAmount', e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">At Sale Agreement</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <input className="input-field" placeholder="Amount" value={formData.financials.agreementSaleAmount} onChange={(e) => handleChange('financials', 'agreementSaleAmount', e.target.value)} />
                                    <input className="input-field" placeholder="Date" value={formData.financials.agreementSaleDateText} onChange={(e) => handleChange('financials', 'agreementSaleDateText', e.target.value)} />
                                </div>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Balance at Registration</label>
                                <input className="input-field" placeholder="Amount" value={formData.financials.balanceAmount} onChange={(e) => handleChange('financials', 'balanceAmount', e.target.value)} />
                            </div>
                             <div className="input-group">
                                <label className="input-label">Cancellation Charge</label>
                                <input className="input-field" value={formData.financials.cancellationCharge} onChange={(e) => handleChange('financials', 'cancellationCharge', e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* Property Section */}
                    <AccordionHeader title="Property Schedules" icon={Building} section="property" />
                    {expandedSection === 'property' && (
                        <div style={{ padding: '1.5rem', background: 'white' }}>
                            <div className="input-group">
                                <label className="input-label">Schedule A (Entire Property)</label>
                                <textarea className="input-field" rows="4" value={formData.property.scheduleA} onChange={(e) => handleChange('property', 'scheduleA', e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Schedule B (Undivided Share)</label>
                                <textarea className="input-field" rows="2" value={formData.property.scheduleB} onChange={(e) => handleChange('property', 'scheduleB', e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Schedule C (Apartment Description)</label>
                                <textarea className="input-field" rows="4" value={formData.property.scheduleC} onChange={(e) => handleChange('property', 'scheduleC', e.target.value)} />
                            </div>
                        </div>
                    )}
                    
                    <div style={{ height: '50px' }}></div>
                </div>
            </div>

            {/* Right: Preview & Action */}
            <div className={`editor-preview ${mobileView !== 'preview' ? 'hidden-mobile' : ''}`}>
                {/* Top Action Bar */}
                <div className="preview-action-bar" style={{ 
                    padding: '1rem 2rem', 
                    background: 'white', 
                    boxShadow: 'var(--shadow-sm)', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border-light)' 
                }}>
                    <div>
                        <h3 style={{ margin: 0 }}>Document Preview</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MOU Draft Template v1.0</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => handleDownloadRequest('DOCX')} disabled={loading} className="btn btn-secondary">
                           <FileType size={18} /> {loading ? 'Processing...' : 'Export DOCX'}
                        </button>
                        <button onClick={() => handleDownloadRequest('PDF')} disabled={loading} className="btn btn-primary">
                            <Download size={18} /> {loading ? 'Processing...' : 'Export PDF'}
                        </button>
                    </div>
                </div>
                
                {/* Preview Area */}
                <div className="preview-container" style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                    <div id="mou-preview" className="preview-document" style={{ 
                        background: 'white', 
                        width: '8.5in', 
                        minHeight: '11in', 
                        padding: '1in', 
                        color: 'black', 
                        fontFamily: '"Times New Roman", serif', 
                        fontSize: '12pt', 
                        lineHeight: '1.6',
                        boxShadow: 'var(--shadow-lg)',
                        marginBottom: '2rem'
                    }}>
                        
                        <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '25px' }}>
                            <div style={{ textDecoration: 'underline', fontSize: '14pt' }}>MEMORANDUM OF UNDERSTANDING</div>
                        </div>

                        <p style={{ textAlign: 'justify' }}>
                            THIS MEMORANDUM OF UNDERSTANDING IS MADE AND EXECUTED ON THIS {dateToWords(formData.agreementDate).toUpperCase()}
                        </p>

                        <div style={{ textAlign: 'center', fontWeight: 'bold', margin: '20px 0' }}>BETWEEN</div>

                        {/* Sellers */}
                        {formData.sellers.map((p, i) => (
                            <div key={i} style={{ marginBottom: '15px' }}>
                                <b>{i+1}) {p.title} {p.name || '[Seller Name]'},</b><br/>
                                S/o {p.fatherName || '[Father Name]'},<br/>
                                Aged about {p.age || '[Age]'} years,<br/>
                                Residing at: {p.address || '[Address]'}<br/>
                                Aadhar No: {p.aadhar || '[Aadhar]'}<br/>
                                PAN No: {p.pan || '[PAN]'}
                            </div>
                        ))}

                        <p>
                            Hereinafter called the <b>{formData.sellers.length > 1 ? 'First Parties/Vendors' : 'First Party/Vendor'}</b> (which expression wherever it so required shall mean and include all his/her heirs, legal representatives, administrators, executors and assigns etc.) of the One part
                        </p>

                        <div style={{ textAlign: 'center', fontWeight: 'bold', margin: '20px 0' }}>AND</div>

                        {/* Buyers */}
                        {formData.buyers.map((p, i) => (
                            <div key={i} style={{ marginBottom: '15px' }}>
                                <b>{i+1}) {p.title} {p.name || '[Buyer Name]'},</b><br/>
                                S/o {p.fatherName || '[Father Name]'},<br/>
                                Aged about {p.age || '[Age]'} years,<br/>
                                Residing at: {p.address || '[Address]'}<br/>
                                Aadhar No: {p.aadhar || '[Aadhar]'}<br/>
                                PAN No: {p.pan || '[PAN]'}
                            </div>
                        ))}

                        <p>
                            Hereinafter called the <b>{formData.buyers.length > 1 ? 'Second Parties/Purchasers' : 'Second Party/Purchaser'}</b> (which expression wherever it so required shall mean and include all his/her heirs, legal representatives, executors and assigns etc.) of the other part.
                        </p>

                        {/* Clauses */}
                        <ol style={{ paddingLeft: '30px', textAlign: 'justify' }}>
                            <li style={{ marginBottom: '10px' }}>
                                WHEREAS the Vendors {formData.sellers.length > 1 ? 'are' : 'is'} fully competent to enter into an agreement with respect to {formData.property.scheduleC || '[Property Description]'}
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                WHEREAS the Vendors has decided to sell to the Purchasers and Purchasers has agreed to buy the said apartment at a total consideration of Rs. {formData.financials.totalConsideration || '___________'} (Rupees {numberToWords(formData.financials.totalConsideration)}).
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                WHEREAS the Purchasers agreed to pay the total Consideration to the Vendors, a sum of Rs. {formData.financials.totalConsideration || '___________'} (Rupees {numberToWords(formData.financials.totalConsideration)}).
                            </li>
                        </ol>

                        <div style={{ textAlign: 'center', fontWeight: 'bold', margin: '20px 0' }}>
                            NOW THIS MOU WITNESSED AND IS HEREBY AGREED BY AND BETWEEN BOTH THE PARTIES HERETO AS FOLLOWS
                        </div>

                        <ol style={{ paddingLeft: '30px', textAlign: 'justify' }}>
                            <li style={{ marginBottom: '10px' }}>
                                That the Purchasers have agreed to pay the total consideration of Rs. {formData.financials.totalConsideration} (Rupees {numberToWords(formData.financials.totalConsideration)}), inclusive of 1% TDS on the considered value, in the following manner:
                                <ol type="a" style={{ marginTop: '5px' }}>
                                    <li style={{marginBottom: '5px'}}>That out of the said total consideration, an amount of Rs. {formData.financials.tokenAdvance1.amount} (Rupees {numberToWords(formData.financials.tokenAdvance1.amount)}) has been paid by the Second Party to the First Party as token advance on {formData.financials.tokenAdvance1.dateText} through {formData.financials.tokenAdvance1.method} with Transaction ID {formData.financials.tokenAdvance1.txnId}.</li>
                                    <li style={{marginBottom: '5px'}}>That a further amount of Rs. {formData.financials.tokenAdvance2.amount} (Rupees {numberToWords(formData.financials.tokenAdvance2.amount)}) has been paid by the Second Party to the First Party as token advance on {formData.financials.tokenAdvance2.dateText} through {formData.financials.tokenAdvance2.method} with Transaction ID {formData.financials.tokenAdvance2.txnId}.</li>
                                    <li style={{marginBottom: '5px'}}>That at the time of signing of this Memorandum of Understanding on {dateToWords(formData.agreementDate)} an amount of Rs. {formData.financials.signingAmount} (Rupees {numberToWords(formData.financials.signingAmount)}) will be paid by the Second Party to the First Party.</li>
                                    <li style={{marginBottom: '5px'}}>That at the time of signing of the Agreement of Sale on or before {formData.financials.agreementSaleDateText} an amount of Rs. {formData.financials.agreementSaleAmount} (Rupees {numberToWords(formData.financials.agreementSaleAmount)}) shall be paid by the Second Party to the First Party.</li>
                                    <li style={{marginBottom: '5px'}}>That the said balance amount of Rs. {formData.financials.balanceAmount} (Rupees {numberToWords(formData.financials.balanceAmount)}) shall be disbursed by the Second Party to the First Party on the date of Registration of the Sale Deed through Demand Draft.</li>
                                    <li>That the Second Party shall deduct applicable 1% TDS and shall furnish Form 16B (TDS Certificate) to the First Party as proof of deduction and remittance of the said TDS in accordance with applicable law.</li>
                                </ol>
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                In the event:
                                <ol type="a" style={{ marginTop: '5px' }}>
                                    <li style={{marginBottom: '5px'}}>The Second Party backs out after the First Party has made the transfer of amount as per the transaction mentioned in this MOU, the Second Party agrees to pay Rs. {formData.financials.cancellationCharge} (Rupees {numberToWords(formData.financials.cancellationCharge)}) towards back-out / cancellation charges.</li>
                                    <li>The First Party backs out or withdraws from the transaction after execution of this MOU, the First Party shall pay the Second Party an amount of Rs. {formData.financials.cancellationCharge} (Rupees {numberToWords(formData.financials.cancellationCharge)}) as cancellation charges.</li>
                                </ol>
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                The First Parties confirms that he has not entered into any agreements for sale or transfer and agrees that he will not enter into any Agreements for sale or transfer of the Schedule 'C' Property with anyone in any manner, until this MOU is in force.
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                ARBITRATION: Should any dispute arise between the parties hereto at anytime during the tenure of this MOU, the same shall, as soon as the dispute shall arise, be referred to the sole arbitration of a person to be mutually agreed to by both the parties to this MOU.
                                <br/><br/>
                                The arbitration shall be conducted as per the rules of the Indian Arbitration and Conciliation Act, 1996 (as amended from time to time) and the place of arbitration shall be at Bangalore. It is being fully understood between the parties that the Arbitrator as mentioned in this clause shall be mutually decided between the parties, within a period of 15 days after either of the parties to this Agreement gives notice in writing to the other regarding the same.
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                This MOU shall be governed by the laws of India and the courts at Bangalore shall have exclusive jurisdiction in respect of matters under this Agreement.
                            </li>
                            <li>
                                Both Parties agree that the Transaction shall be deemed completed upon the First Party receiving the full consideration and the Second Party receiving the duly executed Sale Deed. For the purposes of this MOU, the transaction shall be considered complete only upon fulfilment of these conditions.
                            </li>
                        </ol>

                        {/* Schedules - above witness/signatures */}
                        <div style={{ marginTop: '30px' }}></div>
                        
                        <div style={{ textAlign: 'center', fontWeight: 'bold' }}>SCHEDULE 'A'</div>
                        <div style={{ textAlign: 'center', fontSize: '10pt', fontStyle: 'italic' }}>(Description of Entire Property)</div>
                        <p style={{ textAlign: 'justify', marginTop: '10px' }}>{formData.property.scheduleA || 'Enter Schedule A Details'}</p>

                        <div style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '20px' }}>SCHEDULE 'B'</div>
                        <div style={{ textAlign: 'center', fontSize: '10pt', fontStyle: 'italic' }}>(Undivided interest agreed to be sold in Schedule 'A' Property)</div>
                        <p style={{ textAlign: 'justify', marginTop: '10px' }}>{formData.property.scheduleB || 'Enter Schedule B Details'}</p>

                        <div style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '20px' }}>SCHEDULE 'C'</div>
                        <div style={{ textAlign: 'center', fontSize: '10pt', fontStyle: 'italic' }}>(Description of the Apartment)</div>
                        <p style={{ textAlign: 'justify', marginTop: '10px' }}>{formData.property.scheduleC || 'Enter Schedule C Details'}</p>

                        <div style={{ pageBreakBefore: 'always' }}></div>

                        <p style={{ marginTop: '30px', textAlign: 'justify' }}>
                            IN WITNESS WHEREOF the above-mentioned parties have signed this MOU on the day, month and year mentioned above in the presence of the following;
                        </p>

                        {/* Signatures */}
                        <div className="signatures-section" style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={{ marginBottom: '15px', fontWeight: 'bold' }}>WITNESSES:</div>
                                <div style={{ marginBottom: '40px' }}>
                                    1. ____________________________<br/>
                                    (Name & Address)
                                </div>
                                <div>
                                    2. ____________________________<br/>
                                    (Name & Address)
                                </div>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '40px', minWidth: '200px' }}>
                                <div>
                                    <div style={{ borderTop: '1px solid black', width: '200px', marginBottom: '5px' }}></div>
                                    <b>(FIRST PARTY)</b>
                                </div>
                                <div>
                                    <div style={{ borderTop: '1px solid black', width: '200px', marginBottom: '5px' }}></div>
                                    <b>(SECOND PARTY)</b>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Mobile Tab Navigation */}
            <div className="mobile-tabs">
                <button 
                    className={mobileView === 'form' ? 'active' : ''} 
                    onClick={() => setMobileView('form')}
                >
                    <FileText size={20} />
                    <span>Form</span>
                </button>
                <button 
                    className={mobileView === 'preview' ? 'active' : ''} 
                    onClick={() => setMobileView('preview')}
                >
                    <FileText size={20} />
                    <span>Preview</span>
                </button>
                <button 
                    onClick={() => handleDownloadRequest('PDF')}
                    disabled={loading}
                >
                    <Download size={20} />
                    <span>Download</span>
                </button>
            </div>

            {/* Modal */}
            <UserDetailsModal 
                isOpen={modalOpen} 
                onClose={handleModalClose} 
                onSubmit={handleModalSubmit}
                title={downloadType === 'PDF' ? 'PDF Document' : 'Word Document'}
            />
        </div>
    );
};

export default MOUEditor;
