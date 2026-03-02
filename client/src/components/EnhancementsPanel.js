import React, { useState, useCallback } from 'react';

/**
 * EnhancementsPanel — UI for all 200 roadmap features across 10 categories
 * Categories A-J: Transcript Data, GPA, Transfer Credits, Institution Research,
 * Layout, Seal/Signature, Diploma Generation, Diploma Finishing, Forms/Toggles, Export/Delivery
 */
const EnhancementsPanel = ({ onGenerate, institutionName: initialInstitution = '' }) => {
  const [activeTab, setActiveTab] = useState('transcript');
  const [institutionName, setInstitutionName] = useState(initialInstitution);
  const [toggles, setToggles] = useState({
    includeTransferCredits: true,
    includeAcademicHonors: true,
    includeGPASummaryTable: true,
    includeGraduationDate: true,
    applyGradeForgiveness: false,
    showStudentId: true,
    includeInProgressCourses: true,
    enableEmbossedSeal: true,
    enableGoldFoil: false,
    includeApostille: false,
    outputFormat: 'digital',
    showWatermark: false,
    watermarkText: 'SAMPLE',
    diplomaSize: 'standard'
  });
  const [studentData, setStudentData] = useState({
    firstName: '', middleName: '', lastName: '', suffix: '',
    studentId: '', dateOfBirth: '', major: '', minor: '',
    degreeType: 'bs', cumulativeGPA: '', startYear: '',
    graduationDate: '', creditsRequired: 120
  });

  const handleToggleChange = useCallback((key, value) => {
    setToggles(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleStudentDataChange = useCallback((key, value) => {
    setStudentData(prev => ({ ...prev, [key]: value }));
  }, []);

  const tabs = [
    { id: 'transcript', label: 'Transcript (A-C)', icon: '📄' },
    { id: 'institution', label: 'Institution (D)', icon: '🏛️' },
    { id: 'layout', label: 'Layout & Seals (E-F)', icon: '🎨' },
    { id: 'diploma', label: 'Diploma (G-H)', icon: '🎓' },
    { id: 'options', label: 'Options (I)', icon: '⚙️' },
    { id: 'export', label: 'Export (J)', icon: '📦' }
  ];

  const inputStyle = { width: '100%', padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontWeight: '600', marginBottom: '4px', fontSize: '12px', color: '#374151' };
  const fieldStyle = { marginBottom: '12px' };
  const toggleRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' };
  const sectionStyle = { background: '#f9fafb', borderRadius: '8px', padding: '16px', marginBottom: '16px' };
  const sectionTitleStyle = { fontWeight: '700', fontSize: '14px', marginBottom: '12px', color: '#1f2937' };

  const Toggle = ({ label, helpText, name }) => (
    <div style={toggleRowStyle}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: '500' }}>{label}</div>
        {helpText && <div style={{ fontSize: '11px', color: '#6b7280' }}>{helpText}</div>}
      </div>
      <button
        onClick={() => handleToggleChange(name, !toggles[name])}
        style={{
          width: '42px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer',
          background: toggles[name] ? '#2563eb' : '#d1d5db',
          position: 'relative', transition: 'background 0.2s', flexShrink: 0
        }}
        aria-label={`${toggles[name] ? 'Disable' : 'Enable'} ${label}`}
        role="switch"
        aria-checked={toggles[name]}
      >
        <span style={{
          position: 'absolute', top: '2px', width: '18px', height: '18px', borderRadius: '50%',
          background: '#fff', transition: 'left 0.2s', left: toggles[name] ? '20px' : '2px'
        }} />
      </button>
    </div>
  );

  const renderTranscriptTab = () => (
    <div>
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>📋 Student Information (Features 11-15)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { key: 'firstName', label: 'First Name *' },
            { key: 'lastName', label: 'Last Name *' },
            { key: 'middleName', label: 'Middle Name' },
            { key: 'suffix', label: 'Suffix (Jr., III)' }
          ].map(({ key, label }) => (
            <div key={key} style={fieldStyle}>
              <label style={labelStyle}>{label}</label>
              <input style={inputStyle} value={studentData[key]} onChange={e => handleStudentDataChange(key, e.target.value)} placeholder={label} />
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Major / Field of Study *</label>
            <input style={inputStyle} value={studentData.major} onChange={e => handleStudentDataChange('major', e.target.value)} placeholder="e.g., Computer Science" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Minor (optional)</label>
            <input style={inputStyle} value={studentData.minor} onChange={e => handleStudentDataChange('minor', e.target.value)} placeholder="e.g., Mathematics" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Start Year</label>
            <input style={inputStyle} type="number" value={studentData.startYear} onChange={e => handleStudentDataChange('startYear', e.target.value)} placeholder="e.g., 2020" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Cumulative GPA</label>
            <input style={inputStyle} type="number" step="0.001" min="0" max="4.0" value={studentData.cumulativeGPA} onChange={e => handleStudentDataChange('cumulativeGPA', e.target.value)} placeholder="e.g., 3.750" />
          </div>
        </div>
      </div>
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>📊 GPA & Credits (Features 31-50)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Degree Type</label>
            <select style={inputStyle} value={studentData.degreeType} onChange={e => handleStudentDataChange('degreeType', e.target.value)}>
              {[['bs','Bachelor of Science'],['ba','Bachelor of Arts'],['bba','Bachelor of Business Administration'],['beng','Bachelor of Engineering'],['ms','Master of Science'],['ma','Master of Arts'],['mba','MBA'],['phd','Doctor of Philosophy']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Credits Required for Degree</label>
            <input style={inputStyle} type="number" value={studentData.creditsRequired} onChange={e => handleStudentDataChange('creditsRequired', e.target.value)} placeholder="120" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Graduation Date</label>
            <input style={inputStyle} type="date" value={studentData.graduationDate} onChange={e => handleStudentDataChange('graduationDate', e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderInstitutionTab = () => (
    <div>
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>🏛️ Institution Research (Features 66-90)</div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Institution Name</label>
          <input style={inputStyle} value={institutionName} onChange={e => setInstitutionName(e.target.value)} placeholder="e.g., Harvard University, MIT, Stanford University" />
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Known institutions auto-populate colors, seal, fonts, calendar system, and more</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginTop: '8px' }}>
          {['Harvard University', 'MIT', 'Stanford University', 'UCLA'].map(name => (
            <button key={name} onClick={() => setInstitutionName(name)} style={{ padding: '6px', background: institutionName === name ? '#2563eb' : '#e5e7eb', color: institutionName === name ? '#fff' : '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>{name}</button>
          ))}
        </div>
      </div>
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>ℹ️ Auto-Research Features (D66-D90)</div>
        <ul style={{ fontSize: '12px', color: '#374151', margin: 0, paddingLeft: '16px', lineHeight: '1.8' }}>
          <li>Official full name, acronym, and common name</li>
          <li>Official mailing address and registrar contact</li>
          <li>Accreditation body, status, and type</li>
          <li>Founding year, motto, and institutional tagline</li>
          <li>Official color palette (primary, secondary, accent)</li>
          <li>Institutional fonts for headings and body</li>
          <li>Custom school header matching institutional layout</li>
          <li>Generated institutional seal (SVG, 200px)</li>
          <li>CEEB code, IPEDS Unit ID, FICE code, Carnegie Class</li>
          <li>24-hour cache with manual refresh option</li>
        </ul>
      </div>
    </div>
  );

  const renderLayoutTab = () => (
    <div>
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>📐 Transcript Layout (Features 91-110)</div>
        <Toggle name="showWatermark" label="Show Watermark (SAMPLE / VOID)" helpText="Feature 99: Toggle draft watermark" />
        {toggles.showWatermark && (
          <div style={{ ...fieldStyle, marginTop: '8px' }}>
            <label style={labelStyle}>Watermark Text</label>
            <input style={inputStyle} value={toggles.watermarkText} onChange={e => handleToggleChange('watermarkText', e.target.value)} placeholder="SAMPLE" />
          </div>
        )}
        <div style={fieldStyle}>
          <label style={labelStyle}>Output Format (Feature 102, 185)</label>
          <select style={inputStyle} value={toggles.outputFormat} onChange={e => handleToggleChange('outputFormat', e.target.value)}>
            <option value="digital">Digital (RGB, no crop marks, optimized)</option>
            <option value="print">Print Production (CMYK, 300 DPI, bleed + crop marks)</option>
          </select>
        </div>
      </div>
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>🔏 Registrar Seal & Signature (Features 111-125)</div>
        <Toggle name="enableEmbossedSeal" label="Embossed Seal Simulation" helpText="Feature 118: Raised-seal emboss effect on PDF" />
        <div style={{ fontSize: '12px', color: '#374151', marginTop: '8px', lineHeight: '1.8' }}>
          <b>Auto-generated elements (F111-F125):</b>
          <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
            <li>Calligraphic registrar signature</li>
            <li>Institutional seal (circular SVG with institution name)</li>
            <li>Unique verification code + QR code</li>
            <li>Official transcript certification statement</li>
            <li>AACRAO-standard authenticity notice</li>
            <li>Date stamp in institutional format</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderDiplomaTab = () => (
    <div>
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>🎓 Diploma Generation (Features 126-155)</div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Diploma Size (Feature 142, 160)</label>
          <select style={inputStyle} value={toggles.diplomaSize} onChange={e => handleToggleChange('diplomaSize', e.target.value)}>
            <option value="standard">Standard (8.5"×11")</option>
            <option value="standard_landscape">Standard Landscape (11"×8.5")</option>
            <option value="large">Large (11"×14")</option>
            <option value="extra_large">Extra Large (14"×18")</option>
            <option value="a4">A4</option>
          </select>
        </div>
        <Toggle name="includeApostille" label="Include Apostille Page" helpText="Feature 151: Hague Convention apostille attachment" />
      </div>
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>✨ Diploma Finishing (Features 156-170)</div>
        <Toggle name="enableEmbossedSeal" label="Embossed Seal Layer" helpText="Feature 156: Raised emboss simulation on seal" />
        <Toggle name="enableGoldFoil" label="Gold Foil Simulation" helpText="Feature 157: Gold foil overlay on seal, border, name" />
        <div style={{ fontSize: '12px', color: '#374151', marginTop: '8px', lineHeight: '1.8' }}>
          <b>Available finishing options (H156-H170):</b>
          <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
            <li>Foil stamp layer (separate PDF, PANTONE 871 C)</li>
            <li>Emboss/deboss die-cut spec sheet</li>
            <li>12+ calligraphic font options for student name</li>
            <li>Premium paper simulation (linen, parchment, cotton)</li>
            <li>Frame, matting, and shadow-box specifications</li>
            <li>Certificate of authenticity document</li>
            <li>Diploma tube / flat-mailer shipping label</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderOptionsTab = () => (
    <div>
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>⚙️ Transcript Toggles (Features 173-179)</div>
        <Toggle name="includeTransferCredits" label="Include Transfer Credits" helpText="Feature 173: Show/hide transfer credit section" />
        <Toggle name="includeAcademicHonors" label="Include Academic Honors" helpText="Feature 174: Show/hide honors and awards" />
        <Toggle name="includeGPASummaryTable" label="Include GPA Summary Table" helpText="Feature 175: Show/hide term-by-term GPA table" />
        <Toggle name="includeGraduationDate" label="Include Graduation Date" helpText="Feature 176: Show/hide degree conferral section" />
        <Toggle name="applyGradeForgiveness" label="Apply Grade Forgiveness" helpText="Feature 177: Replace original grades with highest attempt" />
        <Toggle name="showStudentId" label="Show Student ID Number" helpText="Feature 178: Toggle for privacy redaction" />
        <Toggle name="includeInProgressCourses" label="Include In-Progress Courses" helpText="Feature 179: Show courses not yet completed" />
      </div>
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>📝 Entry Forms (Features 171-172, 180-181)</div>
        <div style={{ fontSize: '12px', color: '#374151', lineHeight: '1.8' }}>
          <ul style={{ margin: 0, paddingLeft: '16px' }}>
            <li><b>F171:</b> Smart intake form — auto-populates from institution name</li>
            <li><b>F172:</b> Transfer credit entry form with multi-course support</li>
            <li><b>F180:</b> Academic honors &amp; awards entry (term honors, scholarships, distinctions)</li>
            <li><b>F181:</b> Diploma signatory form (president, provost, registrar, dean)</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderExportTab = () => (
    <div>
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>📦 Export & Delivery (Features 186-200)</div>
        <div style={{ fontSize: '12px', color: '#374151', lineHeight: '1.8' }}>
          <ul style={{ margin: 0, paddingLeft: '16px' }}>
            <li><b>F186:</b> Print-ready transcript PDF (300 DPI, CMYK, bleed + crop marks)</li>
            <li><b>F187:</b> Print-ready diploma PDF (600 DPI, CMYK, separate foil layer)</li>
            <li><b>F188:</b> Digital PDF (optimized, &lt;5 MB, RGB, email-ready)</li>
            <li><b>F189:</b> ZIP archive — transcript + diploma bundled together</li>
            <li><b>F190:</b> AACRAO-standard cover letter auto-generated</li>
            <li><b>F191:</b> 9×12 envelope template with return &amp; recipient address blocks</li>
            <li><b>F192:</b> Print-shop production bundle (base + foil + emboss layers)</li>
            <li><b>F193:</b> Preview thumbnail (PNG, 150 DPI)</li>
            <li><b>F194:</b> Email delivery with formatted cover message</li>
            <li><b>F195:</b> Delivery confirmation receipt document</li>
            <li><b>F196:</b> Account history storage for re-download</li>
            <li><b>F197:</b> Revision history log tracking all changes</li>
            <li><b>F198:</b> JSON/CSV data export for SIS integration</li>
            <li><b>F199:</b> Batch processing — multi-student spreadsheet input</li>
            <li><b>F200:</b> Final QA checklist PDF confirming all fields and design elements</li>
          </ul>
        </div>
      </div>
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>🎯 Output Format (Feature 185)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[['digital', '📱 Digital', 'RGB, 150 DPI, email-optimized'], ['print', '🖨️ Print Production', 'CMYK, 600 DPI, bleed + crop marks']].map(([val, label, desc]) => (
            <button key={val} onClick={() => handleToggleChange('outputFormat', val)} style={{ padding: '12px', background: toggles.outputFormat === val ? '#2563eb' : '#f3f4f6', color: toggles.outputFormat === val ? '#fff' : '#374151', border: `2px solid ${toggles.outputFormat === val ? '#2563eb' : '#d1d5db'}`, borderRadius: '6px', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ fontWeight: '600', fontSize: '12px' }}>{label}</div>
              <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '2px' }}>{desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const tabContent = { transcript: renderTranscriptTab, institution: renderInstitutionTab, layout: renderLayoutTab, diploma: renderDiplomaTab, options: renderOptionsTab, export: renderExportTab };

  const handleGenerate = () => {
    if (typeof onGenerate === 'function') {
      onGenerate({ studentData, institutionName, toggles });
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ background: '#1e3a5f', color: '#fff', padding: '16px 20px', borderRadius: '8px 8px 0 0' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>📜 Document Generator — All 200 Features</h2>
        <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.8 }}>Categories A–J: Transcript &amp; Diploma Auto-Generation Engine</p>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', background: '#f3f4f6', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '10px 14px', background: activeTab === tab.id ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent', cursor: 'pointer', fontSize: '12px', fontWeight: activeTab === tab.id ? '600' : '400', color: activeTab === tab.id ? '#2563eb' : '#6b7280', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ background: '#fff', padding: '20px', border: '1px solid #e5e7eb', borderTop: 'none', maxHeight: '500px', overflowY: 'auto' }}>
        {tabContent[activeTab] && tabContent[activeTab]()}
      </div>

      {/* Generate Button */}
      <div style={{ padding: '16px 20px', background: '#f9fafb', borderTop: '1px solid #e5e7eb', borderRadius: '0 0 8px 8px', display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          200 features • 10 categories • {Object.entries(toggles).filter(([, v]) => v === true).length} options active
        </div>
        <button onClick={handleGenerate} style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
          🚀 Generate Documents
        </button>
      </div>
    </div>
  );
};

export default EnhancementsPanel;
