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
        'First','Second','Third','Fourth','Fifth','Sixth','Seventh','Eighth','Ninth','Tenth',
        'Eleventh','Twelfth','Thirteenth','Fourteenth','Fifteenth','Sixteenth','Seventeenth','Eighteenth','Nineteenth',
        'Twentieth','Twenty First','Twenty Second','Twenty Third','Twenty Fourth','Twenty Fifth','Twenty Sixth','Twenty Seventh','Twenty Eighth','Twenty Ninth',
        'Thirtieth','Thirty First'
    ];
    const dayWord = ordinalMap[day] || `${day}`;
    const yearWord = yearToWords(year);

    return `${dayWord} of ${month} ${yearWord}`.trim();
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
            { title: 'Mr.', name: '', relationPrefix: 'S/o', fatherName: '', age: '', address: '', aadhar: '', pan: '' }
        ],
        buyers: [
            { title: 'Mr.', name: '', relationPrefix: 'S/o', fatherName: '', age: '', address: '', aadhar: '', pan: '' }
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
            cancellationCharge: '5,00,000',
            tdsPercent: '1'
        }
    });

    const pluralize = (count, singular, plural) => (count === 1 ? singular : plural);
    const verb = (count, singularVerb, pluralVerb) => (count === 1 ? singularVerb : pluralVerb);
    const sellersCount = formData.sellers.length;
    const buyersCount = formData.buyers.length;

    const vendorLabel = pluralize(sellersCount, 'Vendor', 'Vendors');
    const purchaserLabel = pluralize(buyersCount, 'Purchaser', 'Purchasers');
    const firstPartyLabel = pluralize(sellersCount, 'First Party/Vendor', 'First Parties/Vendors');
    const secondPartyLabel = pluralize(buyersCount, 'Second Party/Purchaser', 'Second Parties/Purchasers');
    const firstPartyShort = pluralize(sellersCount, 'First Party', 'First Parties');
    const secondPartyShort = pluralize(buyersCount, 'Second Party', 'Second Parties');
    const tdsRate = String(formData.financials.tdsPercent ?? '1').replace(/%/g, '').trim() || '1';

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

        const element = document.getElementById('mou-preview');
        if (!element) {
            console.error('mou-preview element not found');
            setLoading(false);
            return;
        }

        // Export from a print-clone sized to the PDF usable width.
        // This prevents right-edge clipping when html2pdf rasterizes the DOM.
        const printHost = document.createElement('div');
        printHost.style.position = 'fixed';
        printHost.style.left = '-10000px';
        printHost.style.top = '0';
        printHost.style.background = 'white';
        printHost.style.zIndex = '-1';

        const clone = element.cloneNode(true);
        // Ensure clone has predictable dimensions & wrapping
        clone.style.width = '7.5in'; // letter 8.5in - 1in total horizontal margins (0.5in each side)
        clone.style.minHeight = '11in';
        clone.style.padding = '0.5in';
        clone.style.boxSizing = 'border-box';
        clone.style.margin = '0';
        clone.style.boxShadow = 'none';
        clone.style.overflow = 'visible';
        clone.style.wordBreak = 'break-word';
        clone.style.overflowWrap = 'anywhere';
        clone.style.textAlign = 'justify'; // Ensure all text is justified
        clone.style.fontFamily = '"Times New Roman", serif'; // Use consistent font
        clone.style.fontSize = '12pt';
        clone.style.lineHeight = '1.5';
        
        // Fix all paragraphs and divs inside the clone to have proper text alignment
        const allParagraphs = clone.querySelectorAll('p, div');
        allParagraphs.forEach(el => {
            if (!el.style.textAlign || el.style.textAlign === 'left') {
                el.style.textAlign = 'justify';
            }
            // Ensure no elements are cut off
            el.style.overflow = 'visible';
            el.style.wordBreak = 'break-word';
            el.style.overflowWrap = 'anywhere';
        });
        
        // Fix list styling
        const allLists = clone.querySelectorAll('ol, ul');
        allLists.forEach(el => {
            el.style.textAlign = 'justify';
            el.style.marginLeft = '0';
            el.style.paddingLeft = '20px';
        });
        
        // Fix list items
        const allListItems = clone.querySelectorAll('li');
        allListItems.forEach(el => {
            el.style.textAlign = 'justify';
            el.style.marginBottom = '6pt';
            el.style.overflow = 'visible';
            el.style.wordBreak = 'break-word';
        });

        printHost.appendChild(clone);
        document.body.appendChild(printHost);

        const opt = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: 'MOU_Draft.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true, 
                letterRendering: true,
                width: clone.offsetWidth,
                height: clone.offsetHeight,
                scrollX: 0,
                scrollY: 0
            },
            pagebreak: { mode: ['css', 'legacy'] },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf()
            .set(opt)
            .from(clone)
            .save()
            .then(() => setLoading(false))
            .finally(() => {
                try {
                    document.body.removeChild(printHost);
                } catch {
                    // ignore
                }
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

        const previewEl = document.getElementById('mou-preview');
        if (!previewEl) {
            console.error('mou-preview element not found');
            setLoading(false);
            return;
        }

        // Get the full HTML content
        const content = previewEl.innerHTML;
        console.log('Content length:', content.length);
        
        try {
            // Wrap HTML in Word-compatible markup
            const docContent = `
                <html xmlns:o="urn:schemas-microsoft-com:office:office"
                      xmlns:w="urn:schemas-microsoft-com:office:word"
                      xmlns="http://www.w3.org/TR/REC-html40">
                <head><meta charset="utf-8"><title>MOU Draft</title></head>
                <body style="font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6;">
                    ${content}
                </body></html>`;
            const blob = new Blob([docContent], { type: 'application/msword' });
            saveAs(blob, 'MOU_Draft.doc');
            console.log('DOC generated successfully');
        } catch (error) {
            console.error("Error generating DOC:", error);
            alert("Error generating DOC file. Please try again.");
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

    // Inline list styles so PDF/DOCX exports keep alignment
    const previewOlStyle = {
        margin: 0,
        paddingLeft: 0,
        listStylePosition: 'inside',
        textAlign: 'justify',
    };

    const previewNestedOlStyle = {
        marginTop: '5px',
        marginLeft: 0,
        paddingLeft: '18px',
        listStylePosition: 'inside',
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
                                <label className="input-label">Agreement Date</label>
                                <input className="input-field" type="date" value={formData.agreementDate} onChange={(e) => handleChange('root', 'agreementDate', e.target.value)} />
                                <div style={{ marginTop: '6px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    {dateToWords(formData.agreementDate)}
                                </div>
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
                                    
                                    <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                                        <select className="input-field" value={seller.title} onChange={(e) => handleTitleChange('sellers', i, e.target.value)}>
                                            <option value="Mr.">Mr.</option>
                                            <option value="Mrs.">Mrs.</option>
                                            <option value="Ms.">Ms.</option>
                                        </select>
                                        <input className="input-field" placeholder="Full Name" value={seller.name} onChange={(e) => handleChange('sellers', 'name', e.target.value, i)} />
                                    </div>
                                    <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '100px 1fr 100px', gap: '10px' }}>
                                        <select className="input-field" value={seller.relationPrefix || 'S/o'} onChange={(e) => handleChange('sellers', 'relationPrefix', e.target.value, i)}>
                                            <option value="S/o">S/o</option>
                                            <option value="D/o">D/o</option>
                                            <option value="W/o">W/o</option>
                                        </select>
                                        <input className="input-field" placeholder="Father/Mother/Spouse Name" value={seller.fatherName} onChange={(e) => handleChange('sellers', 'fatherName', e.target.value, i)} />
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
                                    
                                    <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                                        <select className="input-field" value={buyer.title} onChange={(e) => handleTitleChange('buyers', i, e.target.value)}>
                                            <option value="Mr.">Mr.</option>
                                            <option value="Mrs.">Mrs.</option>
                                            <option value="Ms.">Ms.</option>
                                        </select>
                                        <input className="input-field" placeholder="Full Name" value={buyer.name} onChange={(e) => handleChange('buyers', 'name', e.target.value, i)} />
                                    </div>
                                    <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '100px 1fr 100px', gap: '10px' }}>
                                        <select className="input-field" value={buyer.relationPrefix || 'S/o'} onChange={(e) => handleChange('buyers', 'relationPrefix', e.target.value, i)}>
                                            <option value="S/o">S/o</option>
                                            <option value="D/o">D/o</option>
                                            <option value="W/o">W/o</option>
                                        </select>
                                        <input className="input-field" placeholder="Father/Mother/Spouse Name" value={buyer.fatherName} onChange={(e) => handleChange('buyers', 'fatherName', e.target.value, i)} />
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
                                <div style={{ marginTop: '6px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    {formData.financials.totalConsideration ? `Rupees ${numberToWords(formData.financials.totalConsideration)}` : ''}
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">TDS (%)</label>
                                <input
                                    className="input-field"
                                    placeholder="e.g. 1"
                                    value={formData.financials.tdsPercent}
                                    onChange={(e) => handleChange('financials', 'tdsPercent', e.target.value)}
                                />
                                <div style={{ marginTop: '6px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    Used in the document wherever TDS is mentioned (useful for NRI/other cases).
                                </div>
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
                                <div style={{ marginTop: '6px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    {formData.financials.signingAmount ? `Rupees ${numberToWords(formData.financials.signingAmount)}` : ''}
                                </div>
                            </div>
                            <div className="input-group">
                                <label className="input-label">At Sale Agreement</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <input className="input-field" placeholder="Amount" value={formData.financials.agreementSaleAmount} onChange={(e) => handleChange('financials', 'agreementSaleAmount', e.target.value)} />
                                    <input className="input-field" placeholder="Date" value={formData.financials.agreementSaleDateText} onChange={(e) => handleChange('financials', 'agreementSaleDateText', e.target.value)} />
                                </div>
                                <div style={{ marginTop: '6px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    {formData.financials.agreementSaleAmount ? `Rupees ${numberToWords(formData.financials.agreementSaleAmount)}` : ''}
                                </div>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Balance at Registration</label>
                                <input className="input-field" placeholder="Amount" value={formData.financials.balanceAmount} onChange={(e) => handleChange('financials', 'balanceAmount', e.target.value)} />
                                <div style={{ marginTop: '6px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    {formData.financials.balanceAmount ? `Rupees ${numberToWords(formData.financials.balanceAmount)}` : ''}
                                </div>
                            </div>
                             <div className="input-group">
                                <label className="input-label">Cancellation Charge</label>
                                <input className="input-field" value={formData.financials.cancellationCharge} onChange={(e) => handleChange('financials', 'cancellationCharge', e.target.value)} />
                                <div style={{ marginTop: '6px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    {formData.financials.cancellationCharge ? `Rupees ${numberToWords(formData.financials.cancellationCharge)}` : ''}
                                </div>
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
                        textAlign: 'justify',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                        overflow: 'visible',
                        boxShadow: 'var(--shadow-lg)',
                        marginBottom: '2rem'
                    }}>
                        
                        <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '25px' }}>
                            <div style={{ textDecoration: 'underline', fontSize: '14pt' }}>MEMORANDUM OF UNDERSTANDING</div>
                        </div>

                        <p style={{ textAlign: 'justify', margin: '0 0 10pt 0' }}>
                            THIS MEMORANDUM OF UNDERSTANDING IS MADE AND EXECUTED ON THIS {dateToWords(formData.agreementDate).toUpperCase()}
                        </p>

                        <div style={{ textAlign: 'center', fontWeight: 'bold', margin: '20px 0' }}>BETWEEN</div>

                        {/* Sellers */}
                        {formData.sellers.map((p, i) => (
                            <div key={i} style={{ marginBottom: '15px' }}>
                                <b>{i+1}) {p.title} {p.name || '[Seller Name]'},</b><br/>
                                {(p.relationPrefix || 'S/o')} {p.fatherName || '[Father/Mother/Spouse Name]'},<br/>
                                Aged about {p.age || '[Age]'} years,<br/>
                                Residing at: {p.address || '[Address]'}<br/>
                                Aadhar No: {p.aadhar || '[Aadhar]'}<br/>
                                PAN No: {p.pan || '[PAN]'}
                            </div>
                        ))}

                        <p style={{ textAlign: 'justify', margin: '0 0 10pt 0' }}>
                            Hereinafter called the <b>{firstPartyLabel}</b> (which expression wherever it so required shall mean and include all his/her heirs, legal representatives, administrators, executors and assigns etc.) of the One part
                        </p>

                        <div style={{ textAlign: 'center', fontWeight: 'bold', margin: '20px 0' }}>AND</div>

                        {/* Buyers */}
                        {formData.buyers.map((p, i) => (
                            <div key={i} style={{ marginBottom: '15px' }}>
                                <b>{i+1}) {p.title} {p.name || '[Buyer Name]'},</b><br/>
                                {(p.relationPrefix || 'S/o')} {p.fatherName || '[Father/Mother/Spouse Name]'},<br/>
                                Aged about {p.age || '[Age]'} years,<br/>
                                Residing at: {p.address || '[Address]'}<br/>
                                Aadhar No: {p.aadhar || '[Aadhar]'}<br/>
                                PAN No: {p.pan || '[PAN]'}
                            </div>
                        ))}

                        <p style={{ textAlign: 'justify', margin: '0 0 10pt 0' }}>
                            Hereinafter called the <b>{secondPartyLabel}</b> (which expression wherever it so required shall mean and include all his/her heirs, legal representatives, executors and assigns etc.) of the other part.
                        </p>

                        {/* Clauses */}
                        <ol style={previewOlStyle}>
                            <li style={{ marginBottom: '10px' }}>
                                WHEREAS the {vendorLabel} {verb(sellersCount, 'is', 'are')} fully competent to enter into an agreement with respect to {formData.property.scheduleC || '[Property Description]'}
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                WHEREAS the {vendorLabel} {verb(sellersCount, 'has', 'have')} decided to sell to the {purchaserLabel} and the {purchaserLabel} {verb(buyersCount, 'has', 'have')} agreed to buy the said apartment at a total consideration of Rs. {formData.financials.totalConsideration || '___________'} (Rupees {numberToWords(formData.financials.totalConsideration)}).
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                WHEREAS the {purchaserLabel} {verb(buyersCount, 'has', 'have')} agreed to pay the total consideration to the {vendorLabel}, a sum of Rs. {formData.financials.totalConsideration || '___________'} (Rupees {numberToWords(formData.financials.totalConsideration)}).
                            </li>
                        </ol>

                        <div style={{ textAlign: 'center', fontWeight: 'bold', margin: '20px 0' }}>
                            NOW THIS MOU WITNESSED AND IS HEREBY AGREED BY AND BETWEEN BOTH THE PARTIES HERETO AS FOLLOWS
                        </div>

                        <ol style={previewOlStyle}>
                            <li style={{ marginBottom: '10px' }}>
                                That the {purchaserLabel} {verb(buyersCount, 'has', 'have')} agreed to pay the total consideration of Rs. {formData.financials.totalConsideration} (Rupees {numberToWords(formData.financials.totalConsideration)}), inclusive of {tdsRate}% TDS on the considered value, in the following manner:
                                <ol type="a" style={previewNestedOlStyle}>
                                    <li style={{marginBottom: '5px'}}>That out of the said total consideration, an amount of Rs. {formData.financials.tokenAdvance1.amount} (Rupees {numberToWords(formData.financials.tokenAdvance1.amount)}) {verb(buyersCount, 'has', 'have')} been paid by the {secondPartyShort} to the {firstPartyShort} as token advance on {formData.financials.tokenAdvance1.dateText} through {formData.financials.tokenAdvance1.method} with Transaction ID {formData.financials.tokenAdvance1.txnId}.</li>
                                    <li style={{marginBottom: '5px'}}>That a further amount of Rs. {formData.financials.tokenAdvance2.amount} (Rupees {numberToWords(formData.financials.tokenAdvance2.amount)}) {verb(buyersCount, 'has', 'have')} been paid by the {secondPartyShort} to the {firstPartyShort} as token advance on {formData.financials.tokenAdvance2.dateText} through {formData.financials.tokenAdvance2.method} with Transaction ID {formData.financials.tokenAdvance2.txnId}.</li>
                                    <li style={{marginBottom: '5px'}}>That at the time of signing of this Memorandum of Understanding on {dateToWords(formData.agreementDate)} an amount of Rs. {formData.financials.signingAmount} (Rupees {numberToWords(formData.financials.signingAmount)}) will be paid by the {secondPartyShort} to the {firstPartyShort}.</li>
                                    <li style={{marginBottom: '5px'}}>That at the time of signing of the Agreement of Sale on or before {formData.financials.agreementSaleDateText} an amount of Rs. {formData.financials.agreementSaleAmount} (Rupees {numberToWords(formData.financials.agreementSaleAmount)}) shall be paid by the {secondPartyShort} to the {firstPartyShort}.</li>
                                    <li style={{marginBottom: '5px'}}>That the said balance amount of Rs. {formData.financials.balanceAmount} (Rupees {numberToWords(formData.financials.balanceAmount)}) shall be disbursed by the {secondPartyShort} to the {firstPartyShort} on the date of Registration of the Sale Deed through Demand Draft.</li>
                                    <li>That the {secondPartyShort} shall deduct applicable {tdsRate}% TDS and shall furnish Form 16B (TDS Certificate) to the {firstPartyShort} as proof of deduction and remittance of the said TDS in accordance with applicable law.</li>
                                </ol>
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                In the event:
                                <ol type="a" style={previewNestedOlStyle}>
                                    <li style={{marginBottom: '5px'}}>If the {secondPartyShort} backs out after the {firstPartyShort} {verb(sellersCount, 'has', 'have')} made the transfer of amount as per the transaction mentioned in this MOU, the {secondPartyShort} agrees to pay Rs. {formData.financials.cancellationCharge} (Rupees {numberToWords(formData.financials.cancellationCharge)}) towards back-out / cancellation charges.</li>
                                    <li>If the {firstPartyShort} backs out or withdraws from the transaction after execution of this MOU, the {firstPartyShort} shall pay the {secondPartyShort} an amount of Rs. {formData.financials.cancellationCharge} (Rupees {numberToWords(formData.financials.cancellationCharge)}) as cancellation charges.</li>
                                </ol>
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                The {firstPartyShort} {verb(sellersCount, 'confirms', 'confirm')} that {verb(sellersCount, 'he/she has', 'they have')} not entered into any agreements for sale or transfer and {verb(sellersCount, 'agrees', 'agree')} that {verb(sellersCount, 'he/she will', 'they will')} not enter into any Agreements for sale or transfer of the Schedule 'C' Property with anyone in any manner, until this MOU is in force.
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
                                Both Parties agree that the Transaction shall be deemed completed upon the {firstPartyShort} receiving the full consideration and the {secondPartyShort} receiving the duly executed Sale Deed. For the purposes of this MOU, the transaction shall be considered complete only upon fulfilment of these conditions.
                            </li>
                        </ol>

                        {/* Schedules - above witness/signatures */}
                        <div style={{ marginTop: '30px' }}></div>
                        
                        <div style={{ textAlign: 'center', fontWeight: 'bold' }}>SCHEDULE 'A'</div>
                        <div style={{ textAlign: 'center', fontSize: '10pt', fontStyle: 'italic' }}>(Description of Entire Property)</div>
                        <p style={{ textAlign: 'justify', marginTop: '10px' }}>{formData.property.scheduleA || ' '}</p>

                        <div style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '20px' }}>SCHEDULE 'B'</div>
                        <div style={{ textAlign: 'center', fontSize: '10pt', fontStyle: 'italic' }}>(Undivided interest agreed to be sold in Schedule 'A' Property)</div>
                        <p style={{ textAlign: 'justify', marginTop: '10px' }}>{formData.property.scheduleB || ' '}</p>

                        <div style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '20px' }}>SCHEDULE 'C'</div>
                        <div style={{ textAlign: 'center', fontSize: '10pt', fontStyle: 'italic' }}>(Description of the Apartment)</div>
                        <p style={{ textAlign: 'justify', marginTop: '10px' }}>{formData.property.scheduleC || ' '}</p>

                        <div style={{ pageBreakBefore: 'always' }}></div>

                        <p style={{ marginTop: '30px', textAlign: 'justify' }}>
                            IN WITNESS WHEREOF the above-mentioned parties have signed this MOU on the day, month and year mentioned above in the presence of the following;
                        </p>

                        {/* Signatures */}
                        <div className="signatures-section" style={{ marginTop: '50px' }}>
                            {/* First Party Section */}
                            <div style={{ marginBottom: '40px' }}>
                                <div style={{ display: 'flex', gap: '40px', marginBottom: '15px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ marginBottom: '15px', fontWeight: 'bold' }}>WITNESSES:</div>
                                        <div style={{ marginBottom: '10px' }}>
                                            1. ____________________________<br/>
                                            (Name & Address)
                                        </div>
                                        <div>
                                            2. ____________________________<br/>
                                            (Name & Address)
                                        </div>
                                    </div>
                                    <div style={{ minWidth: '200px', paddingTop: '40px' }}>
                                        <div style={{ borderTop: '1px solid black', width: '200px', marginBottom: '5px' }}></div>
                                        <b>({firstPartyShort.toUpperCase()})</b>
                                    </div>
                                </div>
                            </div>

                            {/* Second Party Section */}
                            <div>
                                <div style={{ display: 'flex', gap: '40px', marginBottom: '15px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ marginBottom: '15px', fontWeight: 'bold' }}>WITNESSES:</div>
                                        <div style={{ marginBottom: '10px' }}>
                                            1. ____________________________<br/>
                                            (Name & Address)
                                        </div>
                                        <div>
                                            2. ____________________________<br/>
                                            (Name & Address)
                                        </div>
                                    </div>
                                    <div style={{ minWidth: '200px', paddingTop: '40px' }}>
                                        <div style={{ borderTop: '1px solid black', width: '200px', marginBottom: '5px' }}></div>
                                        <b>({secondPartyShort.toUpperCase()})</b>
                                    </div>
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