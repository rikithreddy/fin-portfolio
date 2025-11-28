import { useState, useEffect, useRef } from 'react';
import {
  BarChart3,
  Search,
  Database,
  ArrowRight,
  Linkedin,
  Menu,
  X,
  CheckCircle2,
  TrendingUp,
  Lock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity,
  User,
  FileText
} from 'lucide-react';
import { loadAllBlogs } from './utils/blogLoader';
import { loadAllTestimonials } from './utils/testimonialLoader';

// Icon mapping for blog posts
const ICON_MAP = {
  search: Search,
  activity: Activity,
  zap: Zap,
  database: Database,
  barchart: BarChart3,
  trendingup: TrendingUp,
  user: User,
  filetext: FileText
};

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

/**
 * Helper function to get the icon component for a blog post.
 * Icon inherits color from parent element via currentColor.
 */
const getIconForBlog = (iconType) => {
  const IconComponent = ICON_MAP[iconType] || Search;
  return <IconComponent size={24} />;
};

const Portfolio = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState('home');
  const [selectedStory, setSelectedStory] = useState(null);
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // All blogs page state
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortOrder, setSortOrder] = useState('newest');

  // Blog carousel state
  const [blogCarouselIndex, setBlogCarouselIndex] = useState(0);
  const carouselRef = useRef(null);

  // Testimonials state
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [isTestimonialPaused, setIsTestimonialPaused] = useState(false);

  // Load blog posts from markdown files
  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      try {
        const blogs = await loadAllBlogs();
        // Transform blogs to include icon components
        const transformedBlogs = blogs.map(blog => ({
          ...blog,
          icon: getIconForBlog(blog.iconType)
        }));
        setStories(transformedBlogs);
      } catch (error) {
        console.error('Failed to load blogs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Load testimonials from markdown files
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const loadedTestimonials = await loadAllTestimonials();
        setTestimonials(loadedTestimonials);
      } catch (error) {
        console.error('Failed to load testimonials:', error);
      }
    };

    fetchTestimonials();
  }, []);

  // Auto-advance testimonial slideshow
  useEffect(() => {
    if (testimonials.length <= 1 || isTestimonialPaused) return;

    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length, isTestimonialPaused]);

  // THEME: CALM FINTECH
  // BG: White / Slate-50
  // TEXT: Slate-800 (Charcoal) for readability
  // PRIMARY ACCENT: Sky-600 (Trust Blue)
  // SECONDARY ACCENT: Emerald-500 (Growth/Money)

  const goHome = () => {
    setSelectedStory(null);
    setActiveView('home');
    window.scrollTo(0, 0);
  };

  const goToAllBlogs = () => {
    setSelectedStory(null);
    setSelectedCategories([]);
    setSelectedTags([]);
    setSortOrder('newest');
    setActiveView('all-blogs');
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const goToAllTestimonials = () => {
    setActiveView('all-testimonials');
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  // Helper to truncate text with character limit
  const truncateText = (text, maxLength = 250) => {
    if (!text || text.length <= maxLength) return { text, isTruncated: false };
    return { text: text.substring(0, maxLength).trim() + '...', isTruncated: true };
  };

  const openStory = (story) => {
    setSelectedStory(story);
    setActiveView('blog');
    window.scrollTo(0, 0);
  };

  // Get unique categories and tags from all stories
  const categories = [...new Set(stories.map(s => s.category))];
  const allTags = [...new Set(stories.flatMap(s => s.tags || []))];

  // Toggle functions for multi-select
  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedTags.length > 0;

  // Filter and sort stories for all blogs page
  const filteredStories = stories
    .filter(story => selectedCategories.length === 0 || selectedCategories.includes(story.category))
    .filter(story => selectedTags.length === 0 || (story.tags || []).some(tag => selectedTags.includes(tag)))
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

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
            <button onClick={goToAllBlogs} className="text-sm font-medium text-slate-600 hover:text-sky-600 transition">Blog</button>
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
          <button onClick={goToAllBlogs} className="block text-xl font-medium text-slate-800">Blog</button>
          <a href="#testimonials" onClick={() => setIsMenuOpen(false)} className="block text-xl font-medium text-slate-800">Testimonials</a>
          <a href="https://dots.gtogle.com/forms/d/e/1FAIpQLSdP7cRWIS-LsWOsZS152cXO3hSamIW3bEjEPLV97qNm7HPTxw/viewform?usp=di:logdots.gtogle.com/forms/d/e/1FAIpQLSdP7cRWIS-LsWOsZS152cXO3hSamIW3bEjEPLV97qNm7HPTxw/viewform?usp=di:logdocs.google.com/forms/d/e/1FAIpQLSdP7cRWIS-LsWOtZS152cXO3hSamIW3bEjEPLV97qNm7HPTxw/viewform?usp=dialog" onClick={() => setIsMenuOpen(false)} className="block w-full py-4 text-center bg-sky-600 text-white font-bold rounded-xl">Get Analysis</a>
        </div>
      )}

      {/* MAIN VIEW */}
      {activeView === 'home' ? (
        <>
          {/* HERO SECTION */}
          <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
            <D3NetworkBackground />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              {/* HERO VISUAL: MOVED TO LEFT */}
              <div className="relative order-1 lg:order-1 flex justify-center items-center">
                 {/* Animated Glow Ring */}
                 <div className="absolute w-[500px] h-[500px] bg-sky-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                 <div className="absolute w-[400px] h-[400px] bg-emerald-50 rounded-full blur-2xl opacity-40 animate-pulse delay-700"></div>
                 
                 {/* Main Photo Container with Orbiting Elements */}
                 <div className="relative z-10">
                   {/* Central Photo */}
                   <div className="relative w-64 h-64 lg:w-80 lg:h-80 rounded-full p-2 bg-white shadow-2xl border-4 border-sky-50">
                     <div className="w-full h-full rounded-full overflow-hidden relative">
                       <img 
                         src={`${process.env.PUBLIC_URL}/assets/photo.png`}
                         alt="Rikith Reddy" 
                         className="w-full h-full object-cover"
                       />
                       <div className="absolute inset-0 rounded-full border-[6px] border-sky-500/10 animate-[spin_12s_linear_infinite]"></div>
                     </div>
                   </div>

                   {/* Floating Data Point 1: Anomaly (Top Right) */}
                   <div className="absolute -top-4 -right-12 bg-white p-4 rounded-2xl shadow-lg border border-red-50 animate-[bounce_3s_infinite]">
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

                   {/* Floating Data Point 2: Savings (Bottom Left) */}
                   <div className="absolute -bottom-8 -left-8 bg-white p-4 rounded-2xl shadow-lg border border-emerald-50 animate-[bounce_4s_infinite]">
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

                   {/* Floating Data Point 3: Security (Left) */}
                   <div className="absolute top-1/4 -left-16 bg-white p-3 rounded-2xl shadow-md border border-sky-50 flex items-center space-x-2 animate-[pulse_5s_infinite]">
                     <ShieldCheck size={16} className="text-sky-600" />
                     <span className="text-xs font-bold text-sky-700">Secure & Private</span>
                   </div>
                 </div>
              </div>

              {/* TEXT CONTENT: MOVED TO RIGHT */}
              <div className="space-y-8 order-2 lg:order-2">
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
                  <a href="https://docs.google.com/forms/d/e/1FAIpQLSdP7cRWIS-LsWOtZS152cXO3hSamIW3bEjEPLV97qNm7HPTxw/viewform?usp=dialog" className="inline-flex justify-center items-center px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold transition shadow-xl shadow-sky-100">
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
            </div>
          </section>

          {/* BLOG CAROUSEL */}
          <section id="stories" className="py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-6">
              {/* Header with navigation arrows */}
              <div className="mb-12 flex items-end justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Blog</h2>
                  <p className="text-slate-500 max-w-xl">
                    Numbers are boring until you find the narrative. Here are real examples of insights I've found for my beta clients.
                  </p>
                </div>
                {stories.length > 3 && (
                  <div className="hidden md:flex items-center gap-2">
                    <button
                      onClick={() => setBlogCarouselIndex(Math.max(0, blogCarouselIndex - 1))}
                      disabled={blogCarouselIndex === 0}
                      className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setBlogCarouselIndex(Math.min(Math.max(0, Math.min(stories.length, 10) - 3), blogCarouselIndex + 1))}
                      disabled={blogCarouselIndex >= Math.max(0, Math.min(stories.length, 10) - 3)}
                      className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>

              {/* Carousel container */}
              <div className="relative overflow-hidden">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-500">Loading stories...</p>
                  </div>
                ) : stories.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-500">No stories available.</p>
                  </div>
                ) : (
                  <div
                    ref={carouselRef}
                    className="flex transition-transform duration-500 ease-out gap-6"
                    style={{ transform: `translateX(-${blogCarouselIndex * (100 / 3 + 2)}%)` }}
                  >
                    {stories.slice(0, 10).map((story) => (
                      <div
                        key={story.id}
                        onClick={() => openStory(story)}
                        className="group flex-shrink-0 w-full md:w-[calc(33.333%-1rem)] bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border border-slate-100/80"
                      >
                        {/* Image with gradient overlay */}
                        <div className="h-44 overflow-hidden relative">
                          <img src={story.image} alt={story.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                            <span className="text-white/90 text-xs font-medium">{story.date}</span>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-md bg-white/20 text-white border border-white/20">
                              {story.category}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors leading-snug line-clamp-2">{story.title}</h3>
                          <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-5">
                            {story.preview}
                          </p>

                          {/* Footer with metric and CTA */}
                          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${story.tagStyle.split(' ').find(c => c.startsWith('bg-'))}`}></div>
                              <span className="text-slate-800 font-mono text-sm font-semibold">{story.metric}</span>
                            </div>
                            <span className="flex items-center text-xs font-semibold text-sky-600 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                              Read <ArrowRight size={14} className="ml-1" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dot indicators */}
              {stories.length > 3 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  {Array.from({ length: Math.max(0, Math.min(stories.length, 10) - 2) }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setBlogCarouselIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        blogCarouselIndex === idx
                          ? 'bg-sky-600 w-6'
                          : 'bg-slate-300 hover:bg-slate-400'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* View All Button */}
              {stories.length > 3 && (
                <div className="mt-10 text-center">
                  <button
                    onClick={goToAllBlogs}
                    className="inline-flex items-center px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition"
                  >
                    View All Posts
                    <ArrowRight size={18} className="ml-2" />
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* TESTIMONIALS SLIDESHOW */}
          <section id="testimonials" className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            <div className="max-w-4xl mx-auto px-6 relative">
              {/* Header */}
              <div className="text-center mb-12">
                <p className="text-sky-400 text-sm font-semibold tracking-widest uppercase mb-3">Testimonials</p>
                <h2 className="text-3xl md:text-4xl font-bold text-white">What Clients Are Saying</h2>
              </div>

              {/* Testimonial Card */}
              {testimonials.length > 0 && (
                <div
                  className="relative"
                  onMouseEnter={() => setIsTestimonialPaused(true)}
                  onMouseLeave={() => setIsTestimonialPaused(false)}
                >
                  {/* Large quote icon */}
                  <div className="absolute -top-4 left-8 md:left-12 text-sky-500/20 text-8xl font-serif select-none z-0">
                    "
                  </div>

                  {/* Slide container */}
                  <div className="relative overflow-hidden">
                    <div
                      className="flex transition-transform duration-700 ease-out"
                      style={{ transform: `translateX(-${testimonialIndex * 100}%)` }}
                    >
                      {testimonials.map((t) => (
                        <div
                          key={t.id}
                          className="w-full flex-shrink-0 px-4"
                        >
                          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10">
                            {/* Quote text */}
                            {(() => {
                              const { text: displayText, isTruncated } = truncateText(t.text, 300);
                              return (
                                <div className="mb-10 relative z-10">
                                  <p className="text-white/90 text-xl md:text-2xl leading-relaxed">
                                    "{displayText}"
                                  </p>
                                  {isTruncated && (
                                    <button
                                      onClick={goToAllTestimonials}
                                      className="mt-3 text-sky-400 hover:text-sky-300 text-sm font-medium transition inline-flex items-center gap-1"
                                    >
                                      Read full testimonial <ArrowRight size={14} />
                                    </button>
                                  )}
                                </div>
                              );
                            })()}

                            {/* Author info */}
                            <div className="flex items-center justify-between flex-wrap gap-4">
                              <div className="flex items-center">
                                <div className="relative">
                                  <img
                                    src={t.photo}
                                    alt={t.name}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-sky-400/50 shadow-lg shadow-sky-500/20"
                                  />
                                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                    <CheckCircle2 size={12} className="text-white" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="font-bold text-white flex items-center gap-2">
                                    {t.name}
                                    <a
                                      href={t.linkedin}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-500/20 rounded text-sky-400 hover:text-sky-300 hover:bg-sky-500/30 transition text-xs font-medium"
                                    >
                                      <Linkedin size={12} /> LinkedIn
                                    </a>
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-sky-400 text-sm font-medium">{t.role}</span>
                                    {t.date && (
                                      <>
                                        <span className="text-white/30">|</span>
                                        <span className="text-white/50 text-xs">{t.date}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Highlight badge */}
                              <div className="px-4 py-2 bg-sky-500/20 rounded-full border border-sky-400/30">
                                <span className="text-sky-300 text-sm font-semibold">{t.highlight}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation */}
                  {testimonials.length > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-8">
                      {/* Previous button */}
                      <button
                        onClick={() => setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                        className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all"
                      >
                        <ChevronLeft size={20} />
                      </button>

                      {/* Dots */}
                      <div className="flex items-center gap-2">
                        {testimonials.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setTestimonialIndex(idx)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                              testimonialIndex === idx
                                ? 'w-8 bg-sky-400'
                                : 'w-2 bg-white/30 hover:bg-white/50'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Next button */}
                      <button
                        onClick={() => setTestimonialIndex((prev) => (prev + 1) % testimonials.length)}
                        className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  )}

                  {/* Auto-play indicator */}
                  {testimonials.length > 1 && (
                    <div className="flex justify-center mt-4">
                      <span className="text-white/40 text-xs">
                        {isTestimonialPaused ? 'Paused' : 'Auto-playing'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Empty state */}
              {testimonials.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-white/50">Loading testimonials...</p>
                </div>
              )}

              {/* View All Button */}
              {testimonials.length > 0 && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={goToAllTestimonials}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white font-medium transition-all hover:scale-105"
                  >
                    View All Testimonials
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}
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
      ) : activeView === 'all-blogs' ? (
        /* ALL BLOGS VIEW */
        <div className="pt-28 pb-20 max-w-7xl mx-auto px-6">
          <button onClick={goHome} className="inline-flex items-center text-sm text-slate-400 hover:text-sky-600 transition mb-8 group font-medium">
            <ChevronLeft size={18} className="mr-1 group-hover:-translate-x-1 transition" /> Back Home
          </button>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="mb-10 flex items-end justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-slate-900 mb-2">All Blog Posts</h1>
                  <p className="text-slate-400">
                    <span className="text-sky-600 font-semibold">{filteredStories.length}</span> {filteredStories.length === 1 ? 'post' : 'posts'}
                    {hasActiveFilters && <span className="text-slate-300"> (filtered)</span>}
                  </p>
                </div>
                {hasActiveFilters && (
                  <span className="bg-sky-50 text-sky-700 px-3 py-1.5 rounded-full text-xs font-medium">
                    {selectedCategories.length + selectedTags.length} filter{selectedCategories.length + selectedTags.length > 1 ? 's' : ''} active
                  </span>
                )}
              </div>

              {/* Blog Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {filteredStories.map((story) => (
                  <div
                    key={story.id}
                    onClick={() => openStory(story)}
                    className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img src={story.image} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition" />
                      <div className={`absolute top-4 left-4 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-white/90 backdrop-blur-sm shadow-sm ${story.tagStyle.split(' ').filter(c => c.startsWith('text-')).join(' ')}`}>
                        {story.category}
                      </div>
                    </div>
                    <div className="p-5 flex flex-col">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
                        <span>{story.date}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="font-mono font-semibold text-slate-600">{story.metric}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-sky-600 transition line-clamp-2">
                        {story.title}
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">
                        {story.preview}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">R</div>
                          <span className="text-xs text-slate-400">Rikith Reddy</span>
                        </div>
                        <span className="flex items-center text-xs font-semibold text-sky-600 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all">
                          Read more <ArrowRight size={14} className="ml-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredStories.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-slate-500 text-lg">No posts match your filters.</p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-sky-600 font-medium hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:w-72 flex-shrink-0">
              <div className="lg:sticky lg:top-28 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-100 p-6">
                {/* Sort */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Sort by</h3>
                  <div className="inline-flex bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => setSortOrder('newest')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                        sortOrder === 'newest'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Newest
                    </button>
                    <button
                      onClick={() => setSortOrder('oldest')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                        sortOrder === 'oldest'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Oldest
                    </button>
                  </div>
                </div>

                <div className="h-px bg-slate-200 mb-6" />

                {/* Categories */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Category</h3>
                  <div className="space-y-1">
                    {categories.map(cat => {
                      const count = stories.filter(s => s.category === cat).length;
                      const isSelected = selectedCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                            isSelected
                              ? 'bg-sky-50 text-sky-700 border border-sky-100'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-sky-500' : 'bg-slate-300'}`} />
                            {cat}
                          </span>
                          <span className={`text-xs ${isSelected ? 'text-sky-500' : 'text-slate-400'}`}>{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="h-px bg-slate-200 mb-6" />

                {/* Tags */}
                {allTags.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {allTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition border ${
                            selectedTags.includes(tag)
                              ? 'bg-sky-500 text-white border-sky-500'
                              : 'bg-white text-slate-500 border-slate-200 hover:border-sky-300 hover:text-sky-600'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <>
                    <div className="h-px bg-slate-200 my-6" />
                    <button
                      onClick={clearFilters}
                      className="w-full py-2 text-sm font-medium text-slate-500 hover:text-red-500 transition flex items-center justify-center gap-2"
                    >
                      <X size={14} />
                      Clear all filters
                    </button>
                  </>
                )}
              </div>
            </aside>
          </div>
        </div>
      ) : activeView === 'all-testimonials' ? (
        /* ALL TESTIMONIALS VIEW */
        <div className="pt-28 pb-20 min-h-screen bg-gradient-to-br from-slate-50 to-white">
          <div className="max-w-5xl mx-auto px-6">
            <button onClick={goHome} className="inline-flex items-center text-sm text-slate-400 hover:text-sky-600 transition mb-8 group font-medium">
              <ChevronLeft size={18} className="mr-1 group-hover:-translate-x-1 transition" /> Back Home
            </button>

            <div className="text-center mb-12">
              <p className="text-sky-600 text-sm font-semibold tracking-widest uppercase mb-3">Testimonials</p>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">What Clients Are Saying</h1>
              <p className="text-slate-500 max-w-2xl mx-auto">
                Read the full stories from clients who have experienced the power of data-driven financial analysis.
              </p>
            </div>

            <div className="space-y-8">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative"
                >
                  {/* Quote mark */}
                  <div className="absolute -top-4 left-8 text-sky-100 text-7xl font-serif select-none">
                    "
                  </div>

                  {/* Full testimonial text with preserved line breaks */}
                  <div className="relative z-10 mb-8">
                    {t.text.split('\n').filter(line => line.trim()).map((paragraph, idx) => (
                      <p key={idx} className="text-slate-600 text-lg leading-relaxed mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Author info */}
                  <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-slate-100">
                    <div className="flex items-center">
                      <div className="relative">
                        <img
                          src={t.photo}
                          alt={t.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 size={12} className="text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          {t.name}
                          <a
                            href={t.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-50 border border-sky-100 rounded text-sky-600 hover:text-sky-700 hover:bg-sky-100 transition text-xs font-medium"
                          >
                            <Linkedin size={12} /> LinkedIn
                          </a>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-sky-600 text-sm font-medium">{t.role}</span>
                          {t.date && (
                            <>
                              <span className="text-slate-300">|</span>
                              <span className="text-slate-400 text-xs">{t.date}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Highlight badge */}
                    <div className="px-4 py-2 bg-sky-50 rounded-full border border-sky-100">
                      <span className="text-sky-700 text-sm font-semibold">{t.highlight}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {testimonials.length === 0 && (
              <div className="text-center py-16">
                <p className="text-slate-500">Loading testimonials...</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* BLOG READER VIEW */
        <div className="pt-28 pb-20 max-w-3xl mx-auto px-6">
           <button onClick={goToAllBlogs} className="flex items-center text-slate-500 hover:text-sky-600 transition mb-8 group font-medium">
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
              <button
                onClick={() => window.location.href = '#contact'}
                className="px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition"
              >
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
