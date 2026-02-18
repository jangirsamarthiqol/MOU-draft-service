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

// ... (Helper functions like numberToWords, dateToWords can be imported or duplicated. For now duplicating for speed/isolation as this is a quick draft) 
// Ideally these should be in a utility file. I will duplicate them here to ensure it works immediately without refactoring the whole codebase right now.

const numberToWords = (num) => {
    if (!num) return '';
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

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

const twoDigitToWords = (n) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    const t = Math.floor(n / 10);
    const o = n % 10;
    return o ? `${tens[t]} ${ones[o]}` : tens[t];
};

const yearToWords = (year) => {
    if (!year || Number.isNaN(year)) return '';
    if (year === 2000) return 'Two Thousand';
    if (year > 2000 && year < 2100) {
        const rest = year - 2000;
        return rest ? `Two Thousand ${twoDigitToWords(rest)}`.trim() : 'Two Thousand';
    }
    const thousands = Math.floor(year / 1000);
    const rest = year % 1000;
    const thousandsWord = `${twoDigitToWords(thousands)} Thousand`.trim();
    if (!rest) return thousandsWord;

    const hundreds = Math.floor(rest / 100);
    const lastTwo = rest % 100;
    const hundredsWord = hundreds ? `${twoDigitToWords(hundreds)} Hundred` : '';
    const lastTwoWord = lastTwo ? twoDigitToWords(lastTwo) : '';
    return [thousandsWord, hundredsWord, lastTwoWord].filter(Boolean).join(' ').trim();
};

const parseISODateLocal = (value) => {
    if (typeof value !== 'string') return null;
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const d = Number(m[3]);
    const dt = new Date(y, mo, d);
    return Number.isNaN(dt.getTime()) ? null : dt;
};

const inferRelationPrefixFromTitle = (title) => {
    const t = String(title ?? '')
        .trim()
        .toLowerCase()
        .replace(/\./g, '');

    // Order matters: "mrs" starts with "mr"
    if (t === 'mrs' || t.startsWith('mrs ')) return 'W/o';
    if (t === 'miss' || t.startsWith('miss ')) return 'D/o';
    if (t === 'ms' || t.startsWith('ms ')) return 'D/o';
    if (t === 'mr' || t.startsWith('mr ')) return 'S/o';
    return null;
};

const dateToWords = (dateString) => {
    if (!dateString) return '';

    const isoLocal = parseISODateLocal(dateString);
    const date = isoLocal ?? new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString; // Return original if parse fails

    const day = date.getDate();
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' });

    const ordinalMap = [
        '',
        'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth',
        'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth',
        'Twentieth', 'Twenty First', 'Twenty Second', 'Twenty Third', 'Twenty Fourth', 'Twenty Fifth', 'Twenty Sixth', 'Twenty Seventh', 'Twenty Eighth', 'Twenty Ninth',
        'Thirtieth', 'Thirty First'
    ];
    const dayWord = ordinalMap[day] || `${day}`;
    const yearWord = yearToWords(year);

    return `${dayWord} of ${month} ${yearWord}`.trim();
};

const RentalEditor = () => {
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [downloadType, setDownloadType] = useState(null);
    const [expandedSection, setExpandedSection] = useState('general');
    const [mobileView, setMobileView] = useState('form'); // 'form' or 'preview'

    // Adapted state for Rental Agreement
    const [formData, setFormData] = useState({
        agreementDate: '2026-02-18',
        place: 'Bangalore',
        landlords: [
            { title: 'Mr.', name: '', relationPrefix: 'S/o', fatherName: '', age: '', address: '', aadhar: '', pan: '' }
        ],
        tenants: [
            { title: 'Mr.', name: '', relationPrefix: 'S/o', fatherName: '', age: '', address: '', aadhar: '', pan: '' }
        ],
        property: {
            address: '',
            fittings: ''
        },
        financials: {
            rentAmount: '',
            depositAmount: '',
            noticePeriod: '1 Month',
            lockInPeriod: '11 Months',
            rentIncrease: '5%',
            agreementDuration: '11 Months'
        }
    });

    const pluralize = (count, singular, plural) => (count === 1 ? singular : plural);
    const verb = (count, singularVerb, pluralVerb) => (count === 1 ? singularVerb : pluralVerb);
    const landlordsCount = formData.landlords.length;
    const tenantsCount = formData.tenants.length;

    const landlordLabel = pluralize(landlordsCount, 'Landlord', 'Landlords');
    const tenantLabel = pluralize(tenantsCount, 'Tenant', 'Tenants');
    const firstPartyLabel = pluralize(landlordsCount, 'First Party/Landlord', 'First Parties/Landlords');
    const secondPartyLabel = pluralize(tenantsCount, 'Second Party/Tenant', 'Second Parties/Tenants');

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

    const handleTitleChange = (partyType, index, value) => {
        const newData = { ...formData };
        const list = [...newData[partyType]];
        const party = { ...list[index] };

        party.title = value;
        const inferred = inferRelationPrefixFromTitle(value);
        if (inferred) party.relationPrefix = inferred;

        list[index] = party;
        newData[partyType] = list;
        setFormData(newData);
    };

    const addParty = (type) => {
        const newParty = { title: 'Mr.', name: '', relationPrefix: 'S/o', fatherName: '', age: '', address: '', aadhar: '', pan: '' };
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

        const element = document.getElementById('rental-preview');
        if (!element) {
            console.error('rental-preview element not found');
            setLoading(false);
            return;
        }

        const printHost = document.createElement('div');
        printHost.style.position = 'fixed';
        printHost.style.left = '-10000px';
        printHost.style.top = '0';
        printHost.style.background = 'white';
        printHost.style.zIndex = '-1';

        const clone = element.cloneNode(true);
        clone.style.width = '7.5in';
        clone.style.padding = '0.5in';
        clone.style.boxSizing = 'border-box';
        clone.style.margin = '0';
        clone.style.textAlign = 'justify';
        clone.style.fontFamily = '"Times New Roman", serif';
        clone.style.fontSize = '12pt';
        clone.style.lineHeight = '1.6';

        const allParagraphs = clone.querySelectorAll('p, div, span, li');
        allParagraphs.forEach(el => {
            el.style.textAlign = 'justify';
        });

        printHost.appendChild(clone);
        document.body.appendChild(printHost);

        const opt = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: 'Rental_Agreement_Draft.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            pagebreak: { mode: ['css', 'legacy'] },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(clone).save()
            .then(() => setLoading(false))
            .catch(err => {
                console.error('PDF generation error:', err);
                setLoading(false);
            })
            .finally(() => {
                try { document.body.removeChild(printHost); } catch { }
            });
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

        const previewEl = document.getElementById('rental-preview');
        const content = previewEl.innerHTML;

        try {
            const docContent = `
                <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
                <head><meta charset="utf-8"><title>Rental Agreement Draft</title></head>
                <body>${content}</body></html>`;

            const blob = new Blob([docContent], { type: 'application/msword' });
            saveAs(blob, 'Rental_Agreement_Draft.doc');
        } catch (error) {
            console.error("Error generating DOC:", error);
            alert("Error generating DOC file.");
        }
        setLoading(false);
    };

    const handleDownloadRequest = (type) => {
        setDownloadType(type);
        setModalOpen(true);
    };

    const handleModalSubmit = async ({ name, phone }) => {
        setModalOpen(false);
        if (downloadType === 'PDF') await downloadPDF(name, phone);
        else await downloadDOCX(name, phone);
    };

    const AccordionHeader = ({ title, icon: Icon, section }) => (
        <div
            onClick={() => toggleSection(section)}
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', cursor: 'pointer',
                background: expandedSection === section ? 'var(--primary-light)' : 'white',
                borderBottom: '1px solid var(--border-light)',
                color: expandedSection === section ? 'var(--primary-dark)' : 'var(--text-main)',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                {Icon && <Icon size={18} />} {title}
            </div>
            {expandedSection === section ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
    );

    return (
        <div className="editor-container">
            <div className={`editor-sidebar ${mobileView !== 'form' ? 'hidden-mobile' : ''}`}>
                <div className="editor-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', background: 'white' }}>
                    <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <FileText className="text-primary" /> Rental Agreement
                    </h2>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Fill in the details to generate your Rental Agreement.
                    </p>
                </div>

                <div style={{ flex: 1 }}>
                    <AccordionHeader title="General Details" icon={Calendar} section="general" />
                    {expandedSection === 'general' && (
                        <div className="accordion-content" style={{ padding: '1.5rem', background: 'white' }}>
                            <div className="input-group">
                                <label className="input-label">Agreement Date</label>
                                <input className="input-field" type="date" value={formData.agreementDate} onChange={(e) => handleChange('root', 'agreementDate', e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Place of Execution</label>
                                <input className="input-field" placeholder="e.g. Bangalore" value={formData.place} onChange={(e) => handleChange('root', 'place', e.target.value)} />
                            </div>
                        </div>
                    )}

                    <AccordionHeader title="Landlords" icon={Users} section="landlords" />
                    {expandedSection === 'landlords' && (
                        <div style={{ padding: '1.5rem', background: 'white' }}>
                            {formData.landlords.map((landlord, i) => (
                                <div key={i} className="card" style={{ padding: '1rem', position: 'relative' }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--primary)' }}>Landlord {i + 1}</h4>
                                    <button onClick={() => removeParty('landlords', i)} className="btn-icon" style={{ position: 'absolute', top: '10px', right: '10px', color: '#ef4444', background: '#fee2e2' }}><Trash2 size={14} /></button>

                                    <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
                                        <select className="input-field" value={landlord.title} onChange={(e) => handleTitleChange('landlords', i, e.target.value)}>
                                            <option value="Mr.">Mr.</option>
                                            <option value="Mrs.">Mrs.</option>
                                            <option value="Ms.">Ms.</option>
                                        </select>
                                        <input className="input-field" placeholder="Full Name" value={landlord.name} onChange={(e) => handleChange('landlords', 'name', e.target.value, i)} />
                                    </div>
                                    {/* Add other fields similarly to MOUEditor */}
                                    <textarea className="input-field" placeholder="Address" rows="2" value={landlord.address} onChange={(e) => handleChange('landlords', 'address', e.target.value, i)} style={{ marginTop: '10px' }} />
                                </div>
                            ))}
                            <button onClick={() => addParty('landlords')} className="btn btn-secondary" style={{ width: '100%' }}><UserPlus size={16} /> Add Landlord</button>
                        </div>
                    )}

                    <AccordionHeader title="Tenants" icon={Users} section="tenants" />
                    {expandedSection === 'tenants' && (
                        <div style={{ padding: '1.5rem', background: 'white' }}>
                            {formData.tenants.map((tenant, i) => (
                                <div key={i} className="card" style={{ padding: '1rem', position: 'relative' }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--primary)' }}>Tenant {i + 1}</h4>
                                    <button onClick={() => removeParty('tenants', i)} className="btn-icon" style={{ position: 'absolute', top: '10px', right: '10px', color: '#ef4444', background: '#fee2e2' }}><Trash2 size={14} /></button>

                                    <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
                                        <select className="input-field" value={tenant.title} onChange={(e) => handleTitleChange('tenants', i, e.target.value)}>
                                            <option value="Mr.">Mr.</option>
                                            <option value="Mrs.">Mrs.</option>
                                            <option value="Ms.">Ms.</option>
                                        </select>
                                        <input className="input-field" placeholder="Full Name" value={tenant.name} onChange={(e) => handleChange('tenants', 'name', e.target.value, i)} />
                                    </div>
                                    <textarea className="input-field" placeholder="Address" rows="2" value={tenant.address} onChange={(e) => handleChange('tenants', 'address', e.target.value, i)} style={{ marginTop: '10px' }} />
                                </div>
                            ))}
                            <button onClick={() => addParty('tenants')} className="btn btn-secondary" style={{ width: '100%' }}><UserPlus size={16} /> Add Tenant</button>
                        </div>
                    )}

                    <AccordionHeader title="Property & Terms" icon={Building} section="property" />
                    {expandedSection === 'property' && (
                        <div style={{ padding: '1.5rem', background: 'white' }}>
                            <div className="input-group">
                                <label className="input-label">Property Address</label>
                                <textarea className="input-field" rows="3" value={formData.property.address} onChange={(e) => handleChange('property', 'address', e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Rent Amount (Monthly)</label>
                                <input className="input-field" value={formData.financials.rentAmount} onChange={(e) => handleChange('financials', 'rentAmount', e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Security Deposit</label>
                                <input className="input-field" value={formData.financials.depositAmount} onChange={(e) => handleChange('financials', 'depositAmount', e.target.value)} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Preview */}
            <div className={`editor-preview ${mobileView !== 'preview' ? 'hidden-mobile' : ''}`}>
                <div className="preview-action-bar" style={{ padding: '1rem 2rem', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0 }}>Document Preview</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rental Agreement Draft</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => handleDownloadRequest('DOCX')} disabled={loading} className="btn btn-secondary"><FileType size={18} /> DOCX</button>
                        <button onClick={() => handleDownloadRequest('PDF')} disabled={loading} className="btn btn-primary"><Download size={18} /> PDF</button>
                    </div>
                </div>

                <div className="preview-container" style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                    <div id="rental-preview" className="preview-document" style={{
                        background: 'white', width: '8.5in', minHeight: '11in', padding: '1in',
                        color: 'black', fontFamily: '"Times New Roman", serif', fontSize: '12pt', lineHeight: '1.6',
                        textAlign: 'justify', boxShadow: 'var(--shadow-lg)', marginBottom: '2rem'
                    }}>
                        <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '25px', textDecoration: 'underline', fontSize: '14pt' }}>
                            RENTAL AGREEMENT
                        </div>
                        <p>This Rental Agreement is made on this {dateToWords(formData.agreementDate)} at {formData.place}.</p>

                        <div style={{ textAlign: 'center', fontWeight: 'bold', margin: '15px 0' }}>BETWEEN</div>

                        {formData.landlords.map((p, i) => (
                            <div key={i} style={{ marginBottom: '10px' }}>
                                <b>{p.title} {p.name || '[Landlord Name]'}</b>, Residing at: {p.address || '[Address]'}
                            </div>
                        ))}
                        <p>Hereinafter referred to as the "LANDLORD" (which expression shall mean and include his/her heirs, successors, legal representatives and assigns) of the One Part.</p>

                        <div style={{ textAlign: 'center', fontWeight: 'bold', margin: '15px 0' }}>AND</div>

                        {formData.tenants.map((p, i) => (
                            <div key={i} style={{ marginBottom: '10px' }}>
                                <b>{p.title} {p.name || '[Tenant Name]'}</b>, Residing at: {p.address || '[Address]'}
                            </div>
                        ))}
                        <p>Hereinafter referred to as the "TENANT" (which expression shall mean and include his/her heirs, successors, legal representatives and assigns) of the Other Part.</p>

                        <p>WHEREAS the Landlord is the absolute owner of the property scheduled below.</p>
                        <p>AND WHEREAS the Tenant has requested the Landlord to let out the Schedule Property for residential purpose and the Landlord has agreed to let out the same on the following terms and conditions:</p>

                        <ol style={{ paddingLeft: '20px' }}>
                            <li>The tenancy shall be for a period of {formData.financials.agreementDuration} commencing from today.</li>
                            <li>The monthly rent shall be Rs. {formData.financials.rentAmount} (Rupees {numberToWords(formData.financials.rentAmount)}).</li>
                            <li>The Tenant has paid a security deposit of Rs. {formData.financials.depositAmount} (Rupees {numberToWords(formData.financials.depositAmount)}).</li>
                            {/* Add more clauses as needed */}
                        </ol>

                        <div style={{ marginTop: '20px', fontWeight: 'bold' }}>SCHEDULE PROPERTY</div>
                        <p>{formData.property.address || '[Property Address]'}</p>

                    </div>
                </div>
            </div>

            <UserDetailsModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleModalSubmit}
                title={`Download ${downloadType}`}
            />
        </div>
    );
};

export default RentalEditor;
