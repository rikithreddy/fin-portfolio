import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  Search, 
  Database, 
  ArrowRight, 
  Linkedin, 
  Github, 
  Mail, 
  Menu, 
  X,
  CheckCircle2,
  TrendingUp,
  Lock,
  ChevronLeft,
  ShieldCheck,
  Zap,
  Activity,
  User,
  FileText,
  ArrowUpRight
} from 'lucide-react';

// --- D3.js Helper for React ---
const useD3Script = () => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (window.d3) {
      setLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://d3js.org/d3.v7.min.js';
    script.async = true;
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);
  }, []);
  return loaded;
};

// --- D3 Visualization: "The Connected Ledger" ---
// A calm, subtle network graph on a light background
const D3NetworkBackground = () => {
  const d3Loaded = useD3Script();
  const svgRef = useRef(null);

  useEffect(() => {
    if (!d3Loaded || !svgRef.current) return;

    const d3 = window.d3;
    const svg = d3.select(svgRef.current);
    const width = window.innerWidth;
    const height = 600;

    svg.selectAll("*").remove(); 

    // Generate nodes (Calm Blue Theme)
    const nodes = d3.range(40).map(i => ({
      id: i,
      r: Math.random() * 4 + 2,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3, // Slower velocity for calmness
      vy: (Math.random() - 0.5) * 0.3
    }));

    const links = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        // Higher connectivity for a "secure mesh" feel
        if (Math.random() < 0.08) {
          links.push({ source: nodes[i], target: nodes[j] });
        }
      }
    }

    const simulation = d3.forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength(-30))
      .force("link", d3.forceLink(links).distance(150).strength(0.05)) // Looser, calmer links
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.02));

    // Draw Links (Soft Blue-Gray)
    const link = svg.append("g")
      .attr("stroke", "#94a3b8") // Slate-400
      .attr("stroke-opacity", 0.15)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1);

    // Draw Nodes (Trust Blue)
    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", d => d.r)
      .attr("fill", "#0ea5e9") // Sky-500
      .attr("fill-opacity", 0.6);

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    });

    const timer = d3.timer(() => {
      nodes.forEach(d => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > width) d.vx *= -1;
        if (d.y < 0 || d.y > height) d.vy *= -1;
      });
      simulation.alpha(0.1).restart();
    });

    return () => {
      simulation.stop();
      timer.stop();
    };
  }, [d3Loaded]);

  return (
    <svg 
      ref={svgRef} 
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ width: '100%', height: '100%', opacity: 0.6 }} // Lower opacity for subtlety
    />
  );
};

const Portfolio = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState('home'); 
  const [selectedStory, setSelectedStory] = useState(null);

  // THEME: CALM FINTECH
  // BG: White / Slate-50
  // TEXT: Slate-800 (Charcoal) for readability
  // PRIMARY ACCENT: Sky-600 (Trust Blue)
  // SECONDARY ACCENT: Emerald-500 (Growth/Money)

  const stories = [
    {
      id: 1,
      title: "The $500 Anomaly: Hidden Fuel Charges",
      date: "Oct 12, 2023",
      category: "Forensic Audit",
      preview: "How a 0.5% variance in fuel surcharges compounded into a measurable loss over 12 months.",
      metric: "Recovered ₹500",
      tagStyle: "bg-red-50 text-red-600 border-red-100",
      icon: <Search className="text-red-500" size={24} />,
      image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      content: `
# The Fuel Surcharge Leak

While analyzing credit card statements for a beta client, my anomaly detection script flagged a repeating decimal pattern in fuel transactions.

## The Pattern
Most fuel stations waive the 1% surcharge. However, one specific station chain was applying a "dynamic currency conversion" fee erroneously labeled as a surcharge.

**Result:** A quick dispute raised with the bank recovered the funds. Small leaks sink great ships.
      `
    },
    {
      id: 2,
      title: "The 20.3% December Spike",
      date: "Dec 20, 2023",
      category: "Behavioral",
      preview: "Isolating seasonal spending vectors. Why 3 days in December outweighed 11 months of entertainment costs.",
      metric: "20.3% Variance",
      tagStyle: "bg-purple-50 text-purple-600 border-purple-100",
      icon: <Activity className="text-purple-500" size={24} />,
      image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      content: `
# The December Spike

Context is the difference between "overspending" and "living". 

I noticed a massive spike in the "Entertainment" cluster. A generic app would flag this as "Poor Financial Health".

## Contextual Analysis
By overlaying calendar data, I confirmed these 3 days correlated with a milestone birthday event. 
**Insight:** This wasn't a habit; it was an outlier event. My models now account for "Celebration Exclusion" to avoid false positives in budget alerts.
      `
    },
    {
      id: 3,
      title: "Subscription Creep: The Silent Killer",
      date: "Nov 05, 2023",
      category: "Optimization",
      preview: "Detecting 'Zombie Subscriptions'—services that are auto-renewing but have 0 usage logs.",
      metric: "$240/yr Saved",
      tagStyle: "bg-emerald-50 text-emerald-600 border-emerald-100",
      icon: <Zap className="text-emerald-500" size={24} />,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      content: `
# Zombie Subscriptions

I built a 'Usage vs Cost' ratio analysis. 
If (Cost > 0) AND (Digital Footprint == 0) THEN Flag.

## Findings
My client was paying for a premium delivery service they hadn't used in 8 months.
Total annualized waste: $240.
**Action:** Cancelled immediately.
      `
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: "Alop Gudhate",
      role: "Beta Client",
      // PLEASE REPLACE WITH ACTUAL PHOTO OF ALOP
      photo: "https://randomuser.me/api/portraits/men/32.jpg",
      linkedin: "https://www.linkedin.com/",
      text: "The depth of analysis was startling. He didn't just show me a pie chart; he built a model that predicted my grocery inflation. Recovered lost money I didn't even know was missing.",
      highlight: "Pattern Recognition"
    },
    {
      id: 2,
      name: "Ruchidnya Kadam",
      role: "Beta Client",
      // PLEASE REPLACE WITH ACTUAL PHOTO OF RUCHIDNYA
      photo: "https://randomuser.me/api/portraits/women/44.jpg",
      linkedin: "https://www.linkedin.com/",
      text: "I treat my finances like a business now. Rikith's dashboard showed me exactly where my capital allocation was inefficient. Shifted funds to SIPs immediately.",
      highlight: "Capital Allocation"
    }
  ];

  const goHome = () => {
    setSelectedStory(null);
    setActiveView('home');
    window.scrollTo(0, 0);
  };

  const openStory = (story) => {
    setSelectedStory(story);
    setActiveView('blog');
    window.scrollTo(0, 0);
  };

  const renderMarkdown = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold text-slate-800 mt-8 mb-4 tracking-tight">{line.replace('# ', '')}</h1>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-semibold text-sky-700 mt-6 mb-3">{line.replace('## ', '')}</h2>;
      if (line.startsWith('**')) return <div key={i} className="p-4 border-l-4 border-sky-500 bg-sky-50 my-4 text-slate-700 italic">{line.replace(/\*\*/g, '')}</div>;
      return <p key={i} className="text-slate-600 mb-4 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-sky-100 selection:text-sky-900">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center cursor-pointer group" onClick={goHome}>
            {/* Logo: Simple, Trustworthy Blue */}
            <div className="w-10 h-10 bg-sky-50 rounded-lg mr-3 flex items-center justify-center text-sky-600">
              <ShieldCheck size={24} strokeWidth={2} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Rikith<span className="text-sky-600">Reddy</span>
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button onClick={goHome} className="text-sm font-medium text-slate-600 hover:text-sky-600 transition">Home</button>
            <a href="#stories" onClick={goHome} className="text-sm font-medium text-slate-600 hover:text-sky-600 transition">Blog</a>
            <a href="#testimonials" onClick={goHome} className="text-sm font-medium text-slate-600 hover:text-sky-600 transition">Testimonials</a>
            <a href="#privacy" onClick={goHome} className="text-sm font-medium text-slate-600 hover:text-sky-600 transition">Privacy</a>
            <a href="#contact" className="px-5 py-2.5 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-200">
              Get Analysis
            </a>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-slate-600">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-24 px-6 space-y-6 md:hidden">
          <button onClick={() => {goHome(); setIsMenuOpen(false)}} className="block text-xl font-medium text-slate-800">Home</button>
          <a href="#stories" onClick={() => setIsMenuOpen(false)} className="block text-xl font-medium text-slate-800">Blog</a>
          <a href="#testimonials" onClick={() => setIsMenuOpen(false)} className="block text-xl font-medium text-slate-800">Testimonials</a>
          <a href="#contact" onClick={() => setIsMenuOpen(false)} className="block w-full py-4 text-center bg-sky-600 text-white font-bold rounded-xl">Get Analysis</a>
        </div>
      )}

      {/* MAIN VIEW */}
      {activeView === 'home' ? (
        <>
          {/* HERO SECTION */}
          <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
            <D3NetworkBackground />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 order-2 lg:order-1">
                <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-bold uppercase tracking-wide">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                  </span>
                  <span>Beta Program Open</span>
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight">
                  You are spending more <br/>
                  <span className="text-sky-600">than you think.</span>
                </h1>
                
                <p className="text-xl text-slate-600 max-w-lg leading-relaxed font-light">
                  I apply enterprise data science to your personal finances. 
                  Uncover hidden subscriptions, detect anomalies, and see the story behind your spending.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <a href="#contact" className="inline-flex justify-center items-center px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold transition shadow-xl shadow-sky-100">
                    <Database size={18} className="mr-2" />
                    Analyze My Data
                  </a>
                  <a href="#stories" className="inline-flex justify-center items-center px-8 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition shadow-sm">
                    Read Case Studies
                  </a>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-slate-500 pt-6 border-t border-slate-100 mt-6">
                  <div className="flex items-center"><Lock size={16} className="mr-2 text-sky-600" /> 100% Private</div>
                  <div className="flex items-center"><TrendingUp size={16} className="mr-2 text-sky-600" /> Python Pipeline</div>
                  <div className="flex items-center"><CheckCircle2 size={16} className="mr-2 text-sky-600" /> 48hr Turnaround</div>
                </div>
              </div>

              {/* HERO VISUAL: NEW DESIGN WITH FLOATING DATA POINTS */}
              <div className="relative order-1 lg:order-2 flex justify-center items-center">
                 {/* Animated Glow Ring */}
                 <div className="absolute w-[500px] h-[500px] bg-sky-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                 <div className="absolute w-[400px] h-[400px] bg-emerald-50 rounded-full blur-2xl opacity-40 animate-pulse delay-700"></div>
                 
                 {/* Main Photo Container with Orbiting Elements */}
                 <div className="relative z-10">
                   {/* Central Photo */}
                   <div className="relative w-64 h-64 lg:w-80 lg:h-80 rounded-full p-2 bg-white shadow-2xl border-4 border-sky-50">
                     <div className="w-full h-full rounded-full overflow-hidden relative">
                        {/* PLEASE REPLACE THE SRC BELOW WITH 'image_186761.jpg' */}
                       <img 
                         src="[https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80](https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80)" 
                         alt="Rikith Reddy" 
                         className="w-full h-full object-cover"
                       />
                       <div className="absolute inset-0 rounded-full border-[6px] border-sky-500/10 animate-[spin_12s_linear_infinite]"></div>
                     </div>
                   </div>

                   {/* Floating Data Point 1: Anomaly (Top Left) */}
                   <div className="absolute -top-4 -left-12 bg-white p-4 rounded-2xl shadow-lg border border-red-50 animate-[bounce_3s_infinite]">
                     <div className="flex items-center space-x-3">
                       <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                         <Activity size={20} />
                       </div>
                       <div>
                         <div className="text-xs font-bold text-red-500 uppercase">Anomaly Detected</div>
                         <div className="text-sm font-bold text-slate-800">$500 Duplicate</div>
                       </div>
                     </div>
                   </div>

                   {/* Floating Data Point 2: Savings (Bottom Right) */}
                   <div className="absolute -bottom-8 -right-8 bg-white p-4 rounded-2xl shadow-lg border border-emerald-50 animate-[bounce_4s_infinite]">
                     <div className="flex items-center space-x-3">
                       <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg">
                         <TrendingUp size={20} />
                       </div>
                       <div>
                         <div className="text-xs font-bold text-emerald-500 uppercase">Potential Savings</div>
                         <div className="text-sm font-bold text-slate-800">$240/yr Found</div>
                       </div>
                     </div>
                   </div>

                   {/* Floating Data Point 3: Security (Right) */}
                   <div className="absolute top-1/4 -right-16 bg-white p-3 rounded-2xl shadow-md border border-sky-50 flex items-center space-x-2 animate-[pulse_5s_infinite]">
                     <ShieldCheck size={16} className="text-sky-600" />
                     <span className="text-xs font-bold text-sky-700">Secure & Private</span>
                   </div>
                 </div>
              </div>
            </div>
          </section>

          {/* BLOG GRID */}
          <section id="stories" className="py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-6">
              <div className="mb-16 text-center">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Blog</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">
                  Numbers are boring until you find the narrative. Here are real examples of insights I've found for my beta clients.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {stories.map((story, index) => (
                  <div 
                    key={story.id} 
                    onClick={() => openStory(story)}
                    className="group bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  >
                    <div className="h-48 overflow-hidden relative">
                      <img src={story.image} alt={story.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-slate-900">
                        {String(index + 1).padStart(2, '0')}.
                      </div>
                    </div>
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-6">
                        <div className={`p-3 rounded-xl ${story.tagStyle.split(' ')[0]} ${story.tagStyle.split(' ')[1]}`}>
                          {story.icon}
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded border ${story.tagStyle}`}>
                          {story.category}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-sky-600 transition">{story.title}</h3>
                      <p className="text-slate-500 text-sm mb-6 leading-relaxed line-clamp-3">
                        {story.preview}
                      </p>

                      <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-auto">
                        <span className="text-slate-900 font-mono text-sm font-bold bg-slate-50 px-2 py-1 rounded">{story.metric}</span>
                        <span className="flex items-center text-xs font-bold text-sky-600 group-hover:translate-x-1 transition">
                          Read Story <ArrowRight size={14} className="ml-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section id="testimonials" className="py-24 bg-slate-50 border-y border-slate-200">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-3xl font-bold text-slate-900 text-center mb-16">What People Are Saying</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {testimonials.map((t) => (
                  <div key={t.id} className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 relative">
                    <div className="absolute -top-5 -left-5 w-12 h-12 bg-sky-600 rounded-xl shadow-lg flex items-center justify-center text-white font-serif text-2xl">
                      "
                    </div>
                    <p className="text-slate-600 italic mb-8 leading-relaxed text-lg">"{t.text}"</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img src={t.photo} alt={t.name} className="w-12 h-12 rounded-full mr-4 border-2 border-white shadow-sm" />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center">
                            {t.name}
                            <a href={t.linkedin} target="_blank" rel="noopener noreferrer" className="ml-2 text-sky-600 hover:text-sky-700">
                              <Linkedin size={16} />
                            </a>
                          </div>
                          <div className="text-xs text-sky-600 font-bold uppercase tracking-wide">{t.role}</div>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 text-xs font-bold text-emerald-700">
                        {t.highlight}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PRIVACY & TECH */}
          <section id="privacy" className="py-24 bg-white">
             <div className="max-w-5xl mx-auto px-6">
                <div className="bg-sky-50 rounded-3xl p-8 md:p-12 border border-sky-100">
                   <div className="flex flex-col md:flex-row items-start gap-8">
                      <div className="p-6 bg-white rounded-2xl shadow-md text-sky-600">
                         <ShieldCheck size={48} />
                      </div>
                      <div>
                         <h3 className="text-2xl font-bold text-slate-900 mb-4">Bank-Level Privacy Guarantee</h3>
                         <p className="text-slate-600 mb-6 leading-relaxed text-lg">
                            I understand trust is everything. I treat your data with the same strict protocols used in enterprise environments. 
                         </p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            <div className="flex items-center text-slate-700 font-medium">
                               <CheckCircle2 size={20} className="text-sky-600 mr-3" />
                               No Data Selling (Ever)
                            </div>
                            <div className="flex items-center text-slate-700 font-medium">
                               <CheckCircle2 size={20} className="text-sky-600 mr-3" />
                               Data Deleted After Analysis
                            </div>
                            <div className="flex items-center text-slate-700 font-medium">
                               <CheckCircle2 size={20} className="text-sky-600 mr-3" />
                               Anonymized Insights Only
                            </div>
                            <div className="flex items-center text-slate-700 font-medium">
                               <CheckCircle2 size={20} className="text-sky-600 mr-3" />
                               Local Encrypted Processing
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </section>

          {/* CTA */}
          <section id="contact" className="py-24 bg-slate-900 text-white relative overflow-hidden">
             {/* Subtle Pattern */}
             <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <svg width="100%" height="100%">
                   <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                   </pattern>
                   <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
             </div>
             
             <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
                <h2 className="text-4xl font-bold mb-6">Ready to see the full picture?</h2>
                <p className="text-slate-300 text-lg mb-10 leading-relaxed">
                   I am currently accepting <span className="font-bold text-white border-b-2 border-sky-500">5 new beta clients</span> for free analysis. 
                   Gain the clarity of a CFO for your personal wallet.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                   <a href="mailto:rikithreddy03@gmail.com" className="px-8 py-4 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-500 transition shadow-lg shadow-sky-900/50">
                      Request Free Audit
                   </a>
                   <a href="https://linkedin.com" className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-50 transition">
                      Message on LinkedIn
                   </a>
                </div>
                <p className="mt-8 text-sm text-slate-500">
                  Limited availability for November 2025.
                </p>
             </div>
          </section>
        </>
      ) : (
        /* BLOG READER VIEW */
        <div className="pt-28 pb-20 max-w-3xl mx-auto px-6">
           <button onClick={goHome} className="flex items-center text-slate-500 hover:text-sky-600 transition mb-8 group font-medium">
              <ChevronLeft size={20} className="mr-2 group-hover:-translate-x-1 transition" /> Back to Blog
           </button>

           <div className="mb-10 pb-10 border-b border-slate-100">
              <img src={selectedStory.image} alt={selectedStory.title} className="w-full h-64 object-cover rounded-2xl mb-8 shadow-md" />
              <div className="flex items-center gap-3 mb-6">
                 <span className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-100">
                    {selectedStory.category}
                 </span>
                 <span className="text-slate-400 text-sm font-medium">{selectedStory.date}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">{selectedStory.title}</h1>
              <div className="flex items-center text-slate-500 text-sm font-medium">
                 <div className="w-10 h-10 bg-slate-200 rounded-full mr-3 flex items-center justify-center text-slate-600 font-bold">RR</div>
                 By Rikith Reddy <span className="mx-2">•</span> 4 min read
              </div>
           </div>

           <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-sky-600">
              {renderMarkdown(selectedStory.content)}
           </div>

           <div className="mt-16 p-8 bg-sky-50 border border-sky-100 rounded-2xl text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Need a similar deep dive?</h3>
              <p className="text-slate-600 mb-6">I can run this exact analysis on your data.</p>
              <button className="px-6 py-3 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 transition shadow-md">
                 Start Analysis
              </button>
           </div>
        </div>
      )}

      <footer className="py-12 bg-white border-t border-slate-100 text-center text-slate-400 text-sm">
         <p>© {new Date().getFullYear()} Rikith Reddy. Data Science & Financial Forensics.</p>
      </footer>
    </div>
  );
};

export default Portfolio;