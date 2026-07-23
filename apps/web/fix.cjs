const fs = require('fs');
const lines = fs.readFileSync('d:/Aman Chauhan/project/VaultX/apps/web/src/pages/Landing/index.tsx', 'utf8').split('\n');

const section5Index = lines.findIndex(l => l.includes('{/* ── Section 5: dApp Flow ── */}'));
const section8Index = lines.findIndex(l => l.includes('{/* ── Section 8: Comparison ── */}'));

console.log('Section 5 starts at:', section5Index);
console.log('Section 8 starts at:', section8Index);

const before = lines.slice(0, section5Index).join('\n');
const after = lines.slice(section8Index).join('\n');

const newContent = `      {/* ── Section 5: dApp Flow ── */}
      <StickySection>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: '600px', marginBottom: '4rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3F3F46', marginBottom: '1.5rem' }}>HOW IT WORKS</div>
            <PhysicsFallingText />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', maxWidth: '1000px', width: '100%' }}>
            {[
              { step: '01', label: 'Connect', caption: 'dApp requests wallet access via EIP-1193 provider.' },
              { step: '02', label: 'Review', caption: 'Transaction details are decoded and presented in plain language.' },
              { step: '03', label: 'Approve', caption: 'You sign locally. Nothing is sent until you confirm.' },
              { step: '04', label: 'Done', caption: 'Transaction broadcasts to the network. Receipt is logged.' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.15 }}
                className="step-glow-card"
                style={{ flex: '1 1 200px', maxWidth: '220px', textAlign: 'center', padding: '2rem 1.5rem', borderRadius: '16px' }}
              >
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3F3F46', fontFamily: 'CustomHelvetica, sans-serif', marginBottom: '0.75rem' }}>{item.step}</div>
                <div style={{ fontFamily: 'CustomHelvetica, sans-serif', fontSize: '1.125rem', fontWeight: 600, color: '#FAFAFA', marginBottom: '0.5rem' }}>{item.label}</div>
                <p style={{ color: '#71717A', fontSize: '0.875rem', lineHeight: 1.6 }}>{item.caption}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </StickySection>

      {/* ── Section 6: Security Architecture ── */}
      <StickySection>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3F3F46', marginBottom: '1.5rem' }}>ARCHITECTURE</div>
            <PhysicsUnbreakableText />
          </div>
          {/* Architecture flow */}
          <motion.div id="architecture-flow" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0', maxWidth: '1000px', width: '100%', marginBottom: '4rem', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
            {['Seed Phrase', 'PBKDF2 Derivation', 'AES-256-GCM', 'Local Store', 'Local Signing', 'Network'].map((step, i) => (
              <div key={i} style={{ flex: '1 1 140px', padding: '1.25rem 1rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: 500, color: '#71717A', borderRight: i < 5 ? '1px solid rgba(255,255,255,0.06)' : 'none', letterSpacing: '0.02em' }}>
                {step}
              </div>
            ))}
          </motion.div>
          {/* Feature Carousel */}
          <div className="marquee-container">
            <div className="marquee-track">
              {[
                { title: 'AES-256-GCM', body: 'Military-grade symmetric encryption for vault storage.' },
                { title: 'BIP-39 / BIP-44', body: 'Industry-standard key derivation paths for wallet generation.' },
                { title: 'Auto-Lock', body: 'Configurable timeout clears decrypted keys from memory.' },
                { title: 'Open Source', body: 'Every line of code is auditable. Trust is earned, not assumed.' },
                { title: 'AES-256-GCM', body: 'Military-grade symmetric encryption for vault storage.' },
                { title: 'BIP-39 / BIP-44', body: 'Industry-standard key derivation paths for wallet generation.' },
                { title: 'Auto-Lock', body: 'Configurable timeout clears decrypted keys from memory.' },
                { title: 'Open Source', body: 'Every line of code is auditable. Trust is earned, not assumed.' },
              ].map((card, i) => (
                <div key={i} className="step-glow-card" style={{ flex: '0 0 280px', padding: '2rem', borderRadius: '16px', textAlign: 'left' }}>
                  <h3 style={{ fontFamily: 'CustomHelvetica, sans-serif', fontSize: '1.1rem', fontWeight: 600, color: '#FAFAFA', marginBottom: '0.75rem' }}>{card.title}</h3>
                  <p style={{ color: '#71717A', fontSize: '0.9rem', lineHeight: 1.6 }}>{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </StickySection>

      {/* ── Section 7: Performance ── */}
      <StickySection>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3F3F46', marginBottom: '3rem' }}>PERFORMANCE</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '1000px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
            {[
              { num: '<1s', cap: 'Cold start to ready' },
              { num: '12MB', cap: 'Total bundle size' },
              { num: '8+', cap: 'Supported networks' },
              { num: '0', cap: 'Data sent to servers' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.15 }}
                style={{ flex: '1 1 200px', padding: '3rem 2rem', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none', transition: 'background 0.3s' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ fontFamily: 'CustomHelvetica, sans-serif', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>{stat.num}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#3F3F46' }}>{stat.cap}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </StickySection>`;

fs.writeFileSync('d:/Aman Chauhan/project/VaultX/apps/web/src/pages/Landing/index.tsx', before + '\n' + newContent + '\n' + after);
console.log('Fixed file.');
