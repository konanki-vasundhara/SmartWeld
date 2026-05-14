import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import useKnowledgeStore from '../store/useKnowledgeStore';

export default function KnowledgeCenter() {
  const navigate = useNavigate();
  const { items, fetchKnowledge, isLoading } = useKnowledgeStore();
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchKnowledge();
  }, [fetchKnowledge]);

  // Filter items based on selected category and search query
  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
  };

  const handleDownload = (article) => {
    const content = `
OFFICIAL INDUSTRIAL GUIDE: ${article.title.toUpperCase()}
CATEGORY: ${article.category}
DIFFICULTY: ${article.difficulty}
AUTHOR: ${article.author || 'Smart Weld Expert'}

GUIDE CONTENT
${article.content || article.description}

Verified by Smart Weld Industrial Compliance Department.
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${article.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const categories = [
    { name: 'All', icon: 'list_alt' },
    { name: 'Safety', icon: 'health_and_safety' },
    { name: 'Agriculture', icon: 'agriculture' },
    { name: 'Fabrication', icon: 'architecture' },
    { name: 'Beginner', icon: 'school' }
  ];

  return (
    <>
      <TopAppBar 
        title="Smart Weld"
        rightElement={
          <>
            <div className="hidden md:flex items-center gap-md">
              <nav className="flex gap-md">
                <a className="text-primary dark:text-primary-fixed font-bold" href="#">Home</a>
                <a className="text-on-surface-variant dark:text-outline-variant hover:bg-surface-container-high transition-colors px-2 py-1 rounded" href="#">Guides</a>
                <a className="text-on-surface-variant dark:text-outline-variant hover:bg-surface-container-high transition-colors px-2 py-1 rounded" href="#">Community</a>
              </nav>
              <span className="material-symbols-outlined text-on-surface-variant" data-icon="notifications">notifications</span>
            </div>
            <div className="md:hidden">
              <span className="material-symbols-outlined text-on-surface-variant" data-icon="menu">menu</span>
            </div>
          </>
        }
      />
      <main className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-md">
        {/*  Search Section  */}
        <section className="mb-xl">
          <div className="bg-primary-container p-xl rounded-xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <h2 className="font-headline-xl text-headline-xl text-white mb-md tracking-tight">Industrial Knowledge at Your Fingertips.</h2>
              <p className="text-white/80 font-body-md mb-lg">Access professional welding guides, tractor repair tutorials, and safety certifications.</p>
              <div className="relative">
                <input 
                  className="w-full h-14 pl-12 pr-4 rounded-lg border-2 border-transparent focus:border-primary focus:ring-0 text-body-md outline-none shadow-lg" 
                  placeholder="Search for welding techniques, safety tips..." 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="material-symbols-outlined absolute left-4 top-4 text-outline" data-icon="search">search</span>
              </div>
            </div>
            <div className="absolute right-0 top-0 w-1/3 h-full opacity-20 hidden lg:block">
              <img alt="Welding Sparks" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNYEX3-WaiyYNRU8BeixJ1qrV5U2rRN3piWHnaL4_ERYmValXPake3zoE0iBGX4DbfHZg4RFxy_Qrp5Lt77EyiIp6BweKHe09SE2gV5gJtcLnEbkn8dfEfkan05hdof6QA8yJIo4ROW8SV5WjhkiVehKQI09_7qfuoaB-aTQtGa69nsepSxWc6wEpMmfKLHSLy5V10kiHJ2_WjAppneEjLPsWfKf1ipozquQEnB0r4hJIIOHaQDL4lQvnkT1xeFnQn28cPPovoj28G"/>
            </div>
          </div>
        </section>

        {/*  Article Modal  */}
        {selectedArticle && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-md">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setSelectedArticle(null)}></div>
            <div className="relative w-full max-w-4xl bg-surface-container rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
              <button 
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/40 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg group"
              >
                <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform">close</span>
              </button>
              
              <div className="overflow-y-auto">
                <div className="bg-primary-container p-xl md:p-2xl min-h-[250px] flex flex-col justify-center border-b border-outline-variant relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                  <div className="max-w-3xl mx-auto w-full relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-white text-primary px-2 py-0.5 rounded shadow-sm">
                        {selectedArticle.type === 'guide' ? 'PRACTICAL GUIDE' : 'TECHNICAL ARTICLE'}
                      </span>
                      <span className="text-white/80 font-body-sm font-bold">• {selectedArticle.category}</span>
                    </div>
                    <h2 className="font-headline-lg text-3xl md:text-5xl text-white leading-tight mb-4 tracking-tight">{selectedArticle.title}</h2>
                    <div className="flex items-center gap-4 text-white/90">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span className="text-sm font-medium">{selectedArticle.duration || '10 min read'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                        <span className="text-sm font-medium">{selectedArticle.difficulty}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-md md:p-xl max-w-4xl mx-auto">
                  <div className="prose prose-industrial dark:prose-invert max-w-none">
                    <div className="text-on-surface-variant font-body-lg leading-relaxed whitespace-pre-line space-y-6">
                      {selectedArticle.content || selectedArticle.description}
                    </div>
                  </div>
                  
                  <div className="mt-xl pt-xl border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-xl">
                    <div className="flex items-center gap-md w-full sm:w-auto bg-surface-container-low p-md rounded-xl border border-outline-variant/30">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-2xl">verified_user</span>
                      </div>
                      <div>
                        <p className="font-bold text-base text-primary">{selectedArticle.author || 'Smart Weld Expert'}</p>
                        <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">Industrial Technical Lead</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-sm w-full sm:w-auto">
                      <button 
                        onClick={() => handleDownload(selectedArticle)}
                        className="w-full sm:w-64 bg-primary text-white font-button-text h-14 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                      >
                        <span className="material-symbols-outlined">file_download</span>
                        DOWNLOAD OFFICIAL GUIDE
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/*  Safety Warning Banner  */}
        <section className="mb-xl">
          <div className="bg-safety-orange flex flex-col md:flex-row items-center gap-md p-md rounded-lg text-white shadow-lg">
            <span className="material-symbols-outlined text-4xl" data-icon="warning" data-weight="fill" style={{ 'fontVariationSettings': '\'FILL\' 1' }}>warning</span>
            <div>
              <h3 className="font-label-bold text-label-bold uppercase tracking-widest">Safety First</h3>
              <p className="font-body-md font-bold">Always wear a Level 10+ shade welding helmet and fire-resistant PPE before starting any fabrication task.</p>
            </div>
            <button className="md:ml-auto bg-white text-safety-orange font-button-text px-lg py-sm rounded-full hover:bg-surface-container-low transition-all">VIEW SAFETY CHECKLIST</button>
          </div>
        </section>

        {/*  Category Selection  */}
        <section className="mb-xl">
          <h3 className="font-headline-lg text-headline-lg mb-md">Explore by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-md">
            {categories.map((cat) => (
              <button 
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex flex-col items-center justify-center p-md rounded-xl border transition-all ${selectedCategory === cat.name ? 'bg-primary text-white border-primary shadow-lg scale-105' : 'bg-surface-container border-outline-variant hover:border-primary'}`}
              >
                <span className="material-symbols-outlined text-3xl mb-2">{cat.icon}</span>
                <span className="font-bold text-sm">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/*  Technical Articles & Guides  */}
        <section className="mb-xl">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-headline-lg text-headline-lg">Technical Articles & Guides</h3>
            <button onClick={() => {}} className="text-primary font-label-bold flex items-center gap-xs">VIEW ALL <span className="material-symbols-outlined text-sm" data-icon="open_in_new">open_in_new</span></button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
              {filteredItems.map((video) => (
                <div 
                  key={video.id} 
                  className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden group cursor-pointer hover:border-primary transition-all shadow-sm hover:shadow-md active:scale-[0.98] flex flex-col"
                  onClick={() => handleArticleClick(video)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={video.thumbnailUrl}/>
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/10 transition-all">
                      <div className="w-16 h-16 rounded-full glass-ai flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-4xl">menu_book</span>
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 bg-primary/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                      {video.type === 'guide' ? 'GUIDE' : 'ARTICLE'}
                    </div>
                  </div>
                  <div className="p-md flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-base">
                      <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant px-2 py-0.5 border border-outline-variant rounded">{video.difficulty}</span>
                      <span className="text-on-surface-variant text-[10px] font-bold uppercase">{video.duration || '10m read'}</span>
                    </div>
                    <h5 className="font-label-bold text-md mb-xs group-hover:text-primary transition-colors line-clamp-2">{video.title}</h5>
                    <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-md">{video.description}</p>
                    <div className="mt-auto pt-md border-t border-outline-variant flex items-center justify-between">
                      <span className="text-primary text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">
                        READ FULL GUIDE <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/*  Floating Action Button  */}
      <button onClick={() => navigate('/scanner')} className="fixed right-6 bottom-24 md:bottom-10 bg-primary text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40">
        <span className="material-symbols-outlined" data-icon="photo_camera">photo_camera</span>
      </button>
    </>
  );
}
