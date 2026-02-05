import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import axios from 'axios';
import { asBlob } from 'html-docx-js-typescript';
import { saveAs } from 'file-saver';

const MOUEditor = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        agreementDate: '2026-01-25',
        place: 'Bangalore',
        sellers: [
            { name: '', fatherName: '', age: '', address: '', aadhar: '', pan: '' }
        ],
        buyers: [
            { name: '', fatherName: '', age: '', address: '', aadhar: '', pan: '' }
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
            signingAmount: '', // At MOU signing
            agreementSaleAmount: '', // At Sale Agreement signing
            agreementSaleDateText: '',
            balanceAmount: '', // At Registration
            cancellationCharge: '5,00,000'
        }
    });

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
        const newParty = { name: '', fatherName: '', age: '', address: '', aadhar: '', pan: '' };
        setFormData({ ...formData, [type]: [...formData[type], newParty] });
    };

    const removeParty = (type, index) => {
        const list = [...formData[type]];
        list.splice(index, 1);
        setFormData({ ...formData, [type]: list });
    };

    const downloadPDF = async () => {
        const userName = prompt("Please enter your Name for our records:");
        if (!userName) return;
        const userPhone = prompt("Please enter your Phone Number:");
        if (!userPhone) return;

        setLoading(true);

        // Save User Data
        try {
            await axios.post('http://localhost:3000/api/save-user', {
                name: userName,
                phone: userPhone,
                date: new Date().toISOString(),
                role: 'User'
            });
        } catch (err) {
            console.error("Failed to save user data", err);
            // We continue to download even if save fails, but maybe alert user?
        }

        const element = document.getElementById('mou-preview');
        const opt = {
            margin: [0.5, 0.5, 0.5, 0.5], // Top, Left, Bottom, Right (in inches)
            filename: 'MOU_Draft.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => setLoading(false));
    };

    const downloadDOCX = async () => {
        const userName = prompt("Please enter your Name for our records:");
        if (!userName) return;
        const userPhone = prompt("Please enter your Phone Number:");
        if (!userPhone) return;

        setLoading(true);

        // Save User Data
        try {
            await axios.post('http://localhost:3000/api/save-user', {
                name: userName,
                phone: userPhone,
                date: new Date().toISOString(),
                role: 'User'
            });
        } catch (err) {
            console.error("Failed to save user data", err);
        }

        const content = document.getElementById('mou-preview').innerHTML;
        
        // Wrap content in basic HTML structure for better DOCX conversion
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
            <body>
                ${content}
            </body>
            </html>
        `;

        const converted = asBlob(html);
        saveAs(converted, 'MOU_Draft.docx');
        setLoading(false);
    };

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Left Sidebar: Form */}
            <div style={{ width: '40%', padding: '20px', overflowY: 'auto', borderRight: '1px solid #ddd', background: '#f9f9f9' }}>
                <h2>Edit MOU Details</h2>

                <div className="section">
                    <h3>General</h3>
                    <input className="input" placeholder="Agreement Date (e.g. 25th January 2026)" value={formData.agreementDate} onChange={(e) => handleChange('root', 'agreementDate', e.target.value)} />
                    <input className="input" placeholder="Place (e.g. Bangalore)" value={formData.place} onChange={(e) => handleChange('root', 'place', e.target.value)} />
                </div>

                <div className="section">
                    <h3>Sellers (First Party) <button onClick={() => addParty('sellers')} className="btn-sm">+</button></h3>
                    {formData.sellers.map((seller, i) => (
                        <div key={i} className="card-box">
                            <h4>Seller {i + 1} <button onClick={() => removeParty('sellers', i)} className="btn-xs">x</button></h4>
                            <input placeholder="Name" value={seller.name} onChange={(e) => handleChange('sellers', 'name', e.target.value, i)} />
                            <input placeholder="Father's Name" value={seller.fatherName} onChange={(e) => handleChange('sellers', 'fatherName', e.target.value, i)} />
                            <input placeholder="Age" value={seller.age} onChange={(e) => handleChange('sellers', 'age', e.target.value, i)} />
                            <textarea placeholder="Address" value={seller.address} onChange={(e) => handleChange('sellers', 'address', e.target.value, i)} />
                            <input placeholder="Aadhar" value={seller.aadhar} onChange={(e) => handleChange('sellers', 'aadhar', e.target.value, i)} />
                            <input placeholder="PAN" value={seller.pan} onChange={(e) => handleChange('sellers', 'pan', e.target.value, i)} />
                        </div>
                    ))}
                </div>

                <div className="section">
                    <h3>Buyers (Second Party) <button onClick={() => addParty('buyers')} className="btn-sm">+</button></h3>
                    {formData.buyers.map((buyer, i) => (
                        <div key={i} className="card-box">
                            <h4>Buyer {i + 1} <button onClick={() => removeParty('buyers', i)} className="btn-xs">x</button></h4>
                            <input placeholder="Name" value={buyer.name} onChange={(e) => handleChange('buyers', 'name', e.target.value, i)} />
                            <input placeholder="Father/Husband Name" value={buyer.fatherName} onChange={(e) => handleChange('buyers', 'fatherName', e.target.value, i)} />
                            <input placeholder="Age" value={buyer.age} onChange={(e) => handleChange('buyers', 'age', e.target.value, i)} />
                            <textarea placeholder="Address" value={buyer.address} onChange={(e) => handleChange('buyers', 'address', e.target.value, i)} />
                            <input placeholder="Aadhar" value={buyer.aadhar} onChange={(e) => handleChange('buyers', 'aadhar', e.target.value, i)} />
                            <input placeholder="PAN" value={buyer.pan} onChange={(e) => handleChange('buyers', 'pan', e.target.value, i)} />
                        </div>
                    ))}
                </div>

                <div className="section">
                    <h3>Financials</h3>
                    <label>Total Consideration</label>
                    <input className="input" placeholder="e.g. 2,27,00,000" value={formData.financials.totalConsideration} onChange={(e) => handleChange('financials', 'totalConsideration', e.target.value)} />
                    
                    <h4>Token Advance 1</h4>
                    <input className="input" placeholder="Amount" value={formData.financials.tokenAdvance1.amount} onChange={(e) => handleChange('financials', 'tokenAdvance1', e.target.value, null, 'amount')} />
                    <input className="input" placeholder="Date (e.g. 18th Jan)" value={formData.financials.tokenAdvance1.dateText} onChange={(e) => handleChange('financials', 'tokenAdvance1', e.target.value, null, 'dateText')} />
                    <input className="input" placeholder="Transaction ID" value={formData.financials.tokenAdvance1.txnId} onChange={(e) => handleChange('financials', 'tokenAdvance1', e.target.value, null, 'txnId')} />

                    <h4>Token Advance 2</h4>
                    <input className="input" placeholder="Amount" value={formData.financials.tokenAdvance2.amount} onChange={(e) => handleChange('financials', 'tokenAdvance2', e.target.value, null, 'amount')} />
                    <input className="input" placeholder="Date (e.g. 19th Jan)" value={formData.financials.tokenAdvance2.dateText} onChange={(e) => handleChange('financials', 'tokenAdvance2', e.target.value, null, 'dateText')} />
                    <input className="input" placeholder="Transaction ID" value={formData.financials.tokenAdvance2.txnId} onChange={(e) => handleChange('financials', 'tokenAdvance2', e.target.value, null, 'txnId')} />

                    <h4>Payment Milestones</h4>
                    <label>At MOU Signing</label>
                    <input className="input" placeholder="Amount" value={formData.financials.signingAmount} onChange={(e) => handleChange('financials', 'signingAmount', e.target.value)} />
                    
                    <label>At Agreement of Sale</label>
                    <input className="input" placeholder="Amount" value={formData.financials.agreementSaleAmount} onChange={(e) => handleChange('financials', 'agreementSaleAmount', e.target.value)} />
                    <input className="input" placeholder="Date (e.g. 18th Feb 2026)" value={formData.financials.agreementSaleDateText} onChange={(e) => handleChange('financials', 'agreementSaleDateText', e.target.value)} />
                    
                    <label>Balance at Registration</label>
                    <input className="input" placeholder="Amount" value={formData.financials.balanceAmount} onChange={(e) => handleChange('financials', 'balanceAmount', e.target.value)} />
                    
                    <label>Cancellation Charge</label>
                    <input className="input" value={formData.financials.cancellationCharge} onChange={(e) => handleChange('financials', 'cancellationCharge', e.target.value)} />
                </div>

                <div className="section">
                    <h3>Property Schedules</h3>
                    <label>Schedule A (Description of Entire Property)</label>
                    <textarea rows="5" className="input" value={formData.property.scheduleA} onChange={(e) => handleChange('property', 'scheduleA', e.target.value)} />
                    
                    <label>Schedule B (Undivided Share)</label>
                    <textarea rows="3" className="input" value={formData.property.scheduleB} onChange={(e) => handleChange('property', 'scheduleB', e.target.value)} />
                    
                    <label>Schedule C (Apartment Description)</label>
                    <textarea rows="5" className="input" value={formData.property.scheduleC} onChange={(e) => handleChange('property', 'scheduleC', e.target.value)} />
                </div>

                <div style={{height: '100px'}}></div> {/* Spacer */}
            </div>

            {/* Right: Preview & Action */}
            <div style={{ width: '60%', display: 'flex', flexDirection: 'column', background: '#525659' }}>
                <div style={{ padding: '10px', background: '#333', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Live Preview</span>
                    <div>
                        <button onClick={downloadDOCX} disabled={loading} style={{ background: '#28a745', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>
                            {loading ? 'Processing...' : 'Download DOCX'}
                        </button>
                        <button onClick={downloadPDF} disabled={loading} style={{ background: '#3557f2', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            {loading ? 'Processing...' : 'Download PDF'}
                        </button>
                    </div>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', justifyContent: 'center' }}>
                    <div id="mou-preview" style={{ background: 'white', width: '8.5in', minHeight: '11in', padding: '0.8in', color: 'black', fontFamily: '"Times New Roman", serif', fontSize: '12pt', lineHeight: '1.5' }}>
                        
                        <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '20px' }}>
                            <div style={{ textDecoration: 'underline' }}>MEMORANDUM OF UNDERSTANDING</div>
                        </div>

                        <p style={{ textAlign: 'justify' }}>
                            THIS MEMORANDUM OF UNDERSTANDING IS MADE AND EXECUTED ON THIS {formData.agreementDate.toUpperCase()}
                        </p>

                        <div style={{ textAlign: 'center', fontWeight: 'bold', margin: '20px 0' }}>BETWEEN</div>

                        {/* Sellers */}
                        {formData.sellers.map((p, i) => (
                            <div key={i} style={{ marginBottom: '15px' }}>
                                <b>{i+1}) Mr./Ms. {p.name || '[Seller Name]'},</b><br/>
                                S/o {p.fatherName || '[Father Name]'},<br/>
                                Aged about {p.age || '[Age]'} years,<br/>
                                Residing at: {p.address || '[Address]'}<br/>
                                Aadhar No: {p.aadhar || '[Aadhar]'}<br/>
                                PAN No: {p.pan || '[PAN]'}
                            </div>
                        ))}

                        <p>
                            Hereinafter called the <b>First Parties/Vendors</b> (which expression wherever it so required shall mean and include all his/her heirs, legal representatives, administrators, executors and assigns etc.) of the One part
                        </p>

                        <div style={{ textAlign: 'center', fontWeight: 'bold', margin: '20px 0' }}>AND</div>

                        {/* Buyers */}
                        {formData.buyers.map((p, i) => (
                            <div key={i} style={{ marginBottom: '15px' }}>
                                <b>{i+1}) Mr./Ms. {p.name || '[Buyer Name]'},</b><br/>
                                S/o {p.fatherName || '[Father Name]'},<br/>
                                Aged about {p.age || '[Age]'} years,<br/>
                                Residing at: {p.address || '[Address]'}<br/>
                                Aadhar No: {p.aadhar || '[Aadhar]'}<br/>
                                PAN No: {p.pan || '[PAN]'}
                            </div>
                        ))}

                        <p>
                            Hereinafter called the <b>Second Parties/Purchasers</b> (which expression wherever it so required shall mean and include all his/her heirs, legal representatives, executors and assigns etc.) of the other part.
                        </p>

                        {/* Clauses */}
                        <ol style={{ paddingLeft: '20px', textAlign: 'justify' }}>
                            <li style={{ marginBottom: '10px' }}>
                                WHEREAS the Vendors are fully competent to enter into an agreement with respect to {formData.property.scheduleC || '[Property Description]'}
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                WHEREAS the Vendors has decided to sell to the Purchasers and Purchasers has agreed to buy the said apartment at a total consideration of Rs. {formData.financials.totalConsideration || '___________'}.
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                WHEREAS the Purchasers agreed to pay the total Consideration to the Vendors, a sum of Rs. {formData.financials.totalConsideration || '___________'}.
                            </li>
                        </ol>

                        <div style={{ textAlign: 'center', fontWeight: 'bold', margin: '20px 0' }}>
                            NOW THIS MOU WITNESSED AND IS HEREBY AGREED BY AND BETWEEN BOTH THE PARTIES HERETO AS FOLLOWS
                        </div>

                        <ol style={{ paddingLeft: '20px', textAlign: 'justify' }}>
                            <li style={{ marginBottom: '10px' }}>
                                That the Purchasers have agreed to pay the total consideration of Rs. {formData.financials.totalConsideration}, inclusive of 1% TDS on the considered value, in the following manner:
                                <ol type="a" style={{ marginTop: '5px' }}>
                                    <li>That out of the said total consideration, an amount of Rs. {formData.financials.tokenAdvance1.amount} has been paid by the Second Party to the First Party as token advance on {formData.financials.tokenAdvance1.dateText} through {formData.financials.tokenAdvance1.method} with Transaction ID {formData.financials.tokenAdvance1.txnId}.</li>
                                    <li>That a further amount of Rs. {formData.financials.tokenAdvance2.amount} has been paid by the Second Party to the First Party as token advance on {formData.financials.tokenAdvance2.dateText} through {formData.financials.tokenAdvance2.method} with Transaction ID {formData.financials.tokenAdvance2.txnId}.</li>
                                    <li>That at the time of signing of this Memorandum of Understanding on {formData.agreementDate} an amount of Rs. {formData.financials.signingAmount} will be paid by the Second Party to the First Party.</li>
                                    <li>That at the time of signing of the Agreement of Sale on or before {formData.financials.agreementSaleDateText} an amount of Rs. {formData.financials.agreementSaleAmount} shall be paid by the Second Party to the First Party.</li>
                                    <li>That the said balance amount of Rs. {formData.financials.balanceAmount} shall be disbursed by the Second Party to the First Party on the date of Registration of the Sale Deed through Demand Draft.</li>
                                    <li>That the Second Party shall deduct applicable 1% TDS and shall furnish Form 16B (TDS Certificate) to the First Party as proof of deduction and remittance of the said TDS in accordance with applicable law.</li>
                                </ol>
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                In the event:
                                <ol type="a">
                                    <li>The Second Party backs out after the First Party has made the transfer of amount as per the transaction mentioned in this MOU, the Second Party agrees to pay Rs. {formData.financials.cancellationCharge} towards back-out / cancellation charges.</li>
                                    <li>The First Party backs out or withdraws from the transaction after execution of this MOU, the First Party shall pay the Second Party an amount of Rs. {formData.financials.cancellationCharge} as cancellation charges.</li>
                                </ol>
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                The First Parties confirms that he has not entered into any agreements for sale or transfer and agrees that he will not enter into any Agreements for sale or transfer of the Schedule ‘C’ Property with anyone in any manner, until this MOU is in force.
                            </li>
                            <li>
                                ARBITRATION: Should any dispute arise between the parties hereto... (Standard Clause)
                            </li>
                        </ol>

                        {/* Signatures */}
                        <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ borderTop: '1px solid black', width: '200px', marginTop: '40px' }}></div>
                                (FIRST PARTY)
                            </div>
                            <div>
                                <div style={{ borderTop: '1px solid black', width: '200px', marginTop: '40px' }}></div>
                                (SECOND PARTY)
                            </div>
                        </div>

                        {/* Schedules */}
                        <div style={{pageBreakBefore: 'always'}}></div>
                        
                        <div style={{ textAlign: 'center', fontWeight: 'bold' }}>SCHEDULE ‘A’</div>
                        <div style={{ textAlign: 'center', fontSize: '10pt' }}>(Description of Entire Property)</div>
                        <p style={{ textAlign: 'justify' }}>{formData.property.scheduleA || 'Enter Schedule A Details'}</p>

                        <div style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '20px' }}>SCHEDULE ‘B’</div>
                        <div style={{ textAlign: 'center', fontSize: '10pt' }}>(Undivided interest agreed to be sold in Schedule 'A' Property)</div>
                        <p style={{ textAlign: 'justify' }}>{formData.property.scheduleB || 'Enter Schedule B Details'}</p>

                        <div style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '20px' }}>SCHEDULE ‘C’</div>
                        <div style={{ textAlign: 'center', fontSize: '10pt' }}>(Description of the Apartment)</div>
                        <p style={{ textAlign: 'justify' }}>{formData.property.scheduleC || 'Enter Schedule C Details'}</p>

                    </div>
                </div>
            </div>

            <style>{`
                .section { margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 20px; }
                .input { width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
                .card-box { background: white; padding: 15px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #eee; }
                .btn-sm { background: #3557f2; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; float: right; }
                .btn-xs { background: #e00; color: white; border: none; padding: 2px 6px; border-radius: 4px; cursor: pointer; float: right; font-size: 10px; }
                h2, h3, h4 { margin-top: 0; }
            `}</style>
        </div>
    );
};

export default MOUEditor;
