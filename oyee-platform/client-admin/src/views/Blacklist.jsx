import React from 'react';

export default function Blacklist() {
  return (
    <div className="panel active" id="panel-blacklist">
      <div className="ph"><div className="ph-left"><div className="ph-title">BLACK<span>LIST</span></div><div className="ph-sub">// banned words, patterns, regex</div><div className="ph-line"></div></div></div>
      <div className="g2">
        <div className="card"><div className="card-accent"></div><div className="ct">BANNED PATTERNS</div>
          <div className="ig">
            <label className="il">Add Word / Phrase / /regex/</label>
            <div className="irow"><input className="inp" id="bl-inp" style={{flex:1}} placeholder="word, phrase or /pattern/" /><button className="btn p sm" onClick={() => window.toast && window.toast('ADDED', 'Pattern added to global blacklist.')}>ADD</button></div>
          </div>
          <div className="tc" id="bl-tags">
            <div className="tag">fuck <span className="x">✕</span></div>
            <div className="tag">/0[0-9]&#123;9&#125;/ <span className="x">✕</span></div>
            <div className="tag">bitch <span className="x">✕</span></div>
            <div className="tag">snapchat <span className="x">✕</span></div>
          </div>
        </div>
        <div className="card"><div className="card-accent amber"></div><div className="ct">AUTO-BLOCK RULES</div>
          <div className="tgl-row"><div className="tgl on"></div><div className="tgl-info"><div className="tgl-lbl">Block URLs</div></div></div>
          <div className="tgl-row"><div className="tgl on"></div><div className="tgl-info"><div className="tgl-lbl">Block Phone Numbers</div></div></div>
          <div className="tgl-row"><div className="tgl on"></div><div className="tgl-info"><div className="tgl-lbl">Block PII (names/emails)</div></div></div>
          <div className="tgl-row"><div className="tgl"></div><div className="tgl-info"><div className="tgl-lbl">Block Competitor Mentions</div></div></div>
        </div>
      </div>
    </div>
  );
}