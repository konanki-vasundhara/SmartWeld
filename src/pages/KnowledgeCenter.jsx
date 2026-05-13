import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';

export default function KnowledgeCenter() {
  const navigate = useNavigate();
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
<h2 className="font-headline-xl text-headline-xl text-white mb-md">Industrial Knowledge at Your Fingertips.</h2>
<p className="text-on-primary-container font-body-md mb-lg">Access professional welding guides, tractor repair tutorials, and safety certifications.</p>
<div className="relative">
<input className="w-full h-14 pl-12 pr-4 rounded-lg border-2 border-transparent focus:border-primary focus:ring-0 text-body-md outline-none" placeholder="Search for welding techniques, safety tips..." type="text"/>
<span className="material-symbols-outlined absolute left-4 top-4 text-outline" data-icon="search">search</span>
</div>
</div>
<div className="absolute right-0 top-0 w-1/3 h-full opacity-20 hidden lg:block">
<img alt="Welding Sparks" className="w-full h-full object-cover" data-alt="A high-definition, close-up photograph of bright industrial welding sparks flying against a dark, metallic background. The lighting is dramatic and focused, highlighting the molten orange of the sparks and the cold steel blue of the metal workshop. The aesthetic is professional and rugged, conveying a sense of heavy industry and precision engineering." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNYEX3-WaiyYNRU8BeixJ1qrV5U2rRN3piWHnaL4_ERYmValXPake3zoE0iBGX4DbfHZg4RFxy_Qrp5Lt77EyiIp6BweKHe09SE2gV5gJtcLnEbkn8dfEfkan05hdof6QA8yJIo4ROW8SV5WjhkiVehKQI09_7qfuoaB-aTQtGa69nsepSxWc6wEpMmfKLHSLy5V10kiHJ2_WjAppneEjLPsWfKf1ipozquQEnB0r4hJIIOHaQDL4lQvnkT1xeFnQn28cPPovoj28G"/>
</div>
</div>
</section>
{/*  Safety Warning Banner  */}
<section className="mb-xl">
<div className="bg-safety-orange flex flex-col md:flex-row items-center gap-md p-md rounded-lg text-white shadow-lg">
<span className="material-symbols-outlined text-4xl" data-icon="warning" data-weight="fill" style={{ 'fontVariationSettings': '\'FILL\' 1' }}>warning</span>
<div>
<h3 className="font-label-bold text-label-bold uppercase tracking-widest">Safety First</h3>
<p className="font-body-md font-bold">Always wear a Level 10+ shade welding helmet and fire-resistant PPE before starting any fabrication task. Read local safety codes before tractor repairs.</p>
</div>
<button className="md:ml-auto bg-white text-safety-orange font-button-text px-lg py-sm rounded-full hover:bg-surface-container-low transition-all">VIEW SAFETY CHECKLIST</button>
</div>
</section>
{/*  Featured Categories (Bento Grid)  */}
<section className="mb-xl">
<h3 className="font-headline-lg text-headline-lg mb-md">Featured Categories</h3>
<div className="grid grid-cols-1 md:grid-cols-4 gap-md">
{/*  Large Card  */}
<div className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container shadow-sm hover:shadow-md transition-all">
<img alt="Types of Welding" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A professional welder in a clean, industrial setting performing high-precision TIG welding on a stainless steel pipe. The background is a slightly blurred, modern manufacturing facility with cool blue and grey tones. The composition is balanced and clean, showcasing the intricate detail of the weld bead and the protective gear of the operator." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNxPRfipD6Zh9nqfhOQQEAYW_gX21C0dIgg_O4fAZ1DWMAjRjW7JpOwGilVqAApY_YRaF0O-rLtzaZ8-HKCT8U54Ju5Q8pbtvS8mS1nyZAgqBrNamTp0gPJEDr3ssuJq5dPAMECpnt6Jr9Zsz_UwF3cMwOSmAZfKICnJu3iwVtw2Qry5omTRCocw3qyWMG6ajdcCUJH5Jz9SFxYZnSLhYdIwbiPV4VsXjrDRvKLm3IK8LKkDUXlnKEwBrIxkh-J__5FvDNNE_XdBk6"/>
<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-md">
<h4 className="text-white font-headline-lg text-headline-lg">Types of Welding</h4>
<p className="text-on-primary-container text-body-sm">MIG, TIG, Stick, and Flux-Core explained.</p>
</div>
</div>
{/*  Small Cards  */}
<div className="group bg-surface-container border border-outline-variant rounded-xl p-md flex flex-col justify-between hover:bg-secondary-container transition-colors">
<span className="material-symbols-outlined text-4xl text-primary" data-icon="health_and_safety">health_and_safety</span>
<div>
<h4 className="font-label-bold text-lg mt-md">Safety Precautions</h4>
<p className="text-body-sm text-on-surface-variant">OSHA standards and field safety.</p>
</div>
</div>
<div className="group bg-surface-container border border-outline-variant rounded-xl p-md flex flex-col justify-between hover:bg-secondary-container transition-colors">
<span className="material-symbols-outlined text-4xl text-primary" data-icon="agriculture">agriculture</span>
<div>
<h4 className="font-label-bold text-lg mt-md">Tractor Repair Guides</h4>
<p className="text-body-sm text-on-surface-variant">Framework and implement repairs.</p>
</div>
</div>
<div className="md:col-span-2 group bg-surface-container border border-outline-variant rounded-xl p-md flex items-center justify-between hover:bg-secondary-container transition-colors">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-4xl text-primary" data-icon="architecture">architecture</span>
<div>
<h4 className="font-label-bold text-lg">Fabrication Tutorials</h4>
<p className="text-body-sm text-on-surface-variant">From blueprints to finished products.</p>
</div>
</div>
<span className="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
</div>
</div>
</section>
{/*  Video Learning Modules  */}
<section className="mb-xl">
<div className="flex justify-between items-center mb-md">
<h3 className="font-headline-lg text-headline-lg">Video Learning Modules</h3>
<button onClick={() => {}} className="text-primary font-label-bold flex items-center gap-xs">VIEW ALL <span className="material-symbols-outlined text-sm" data-icon="open_in_new">open_in_new</span></button>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
{/*  Video Card 1  */}
<div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden group">
<div className="relative h-48 overflow-hidden">
<img alt="Video Thumbnail" className="w-full h-full object-cover" data-alt="A cinematic, wide-angle shot of a large industrial forge with bright orange molten metal pouring into a mold. The atmosphere is filled with steam and a warm, glowing light that contrasts with the dark, heavy industrial machinery. The style is clean and high-end, focusing on the power and precision of modern manufacturing processes." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7PsjOfVVKKwwz4OZQmsePHZcPIpnsJh28cuVBnIcRYXi2WfRmxfhYSqdEQB_CibMLbjbvS_wZjybXXumRsMQFTSqGPGk2LunBm5io62FsYYx90ILoD8QIWUHAVzM7QhOsK0GY9dlHn2aV_fAEb4jPebfz5-SqM9PeDmuQ8w_ns0h4t6bT1kJrjNcdaPr74JJOkqWWZh2Gokcg9vV21trDTVRNP-r6tLSfVorFDPevJYL9zv0SXhEELKzrbRRXfTV7mfawnRCoDD0t"/>
<div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
<div className="w-16 h-16 rounded-full glass-ai flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-4xl" data-icon="play_arrow" data-weight="fill" style={{ 'fontVariationSettings': '\'FILL\' 1' }}>play_arrow</span>
</div>
</div>
<div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded">12:45</div>
</div>
<div className="p-md">
<div className="flex justify-between items-start mb-base">
<span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant px-2 py-0.5 border border-outline-variant rounded">Beginner</span>
<span className="material-symbols-outlined text-on-surface-variant" data-icon="more_vert">more_vert</span>
</div>
<h5 className="font-label-bold text-md mb-xs">Basics of Arc Welding</h5>
<p className="text-body-sm text-on-surface-variant">Master the fundamental techniques of SMAW in this comprehensive starter guide.</p>
</div>
</div>
{/*  Video Card 2  */}
<div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden group">
<div className="relative h-48 overflow-hidden">
<img alt="Video Thumbnail" className="w-full h-full object-cover" data-alt="A focused close-up of an industrial repair on a large green agricultural tractor. The lighting is natural morning sunlight, casting soft shadows on the metal frame. The image emphasizes high-quality craftsmanship and the intersection of traditional farming and modern mechanical repair techniques." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9qsa7IivRPjcO-MGe2axTC8h09ejS4VBTnrR7K52X22MHE1gwWAkKqGS6C0ek8J1wVaIO7N0LiFnV-8wqxVjKUbunPy0lqFU7duiZEPTS1pvjOhagT9KwhIsd8s64I93colPnvBCNAxxRwI1t8ss2mGZOvSFXjzsivQLtLkEu7ASyPqT7PgBlJ4Oz5o7fwYXUZn4RZgxi_TBhf8e1Xd-4BqoKLJTW92-uUyAP8cnR_j97jNMwy2ikV3t5toacvFfn1cOhUPzxJK8C"/>
<div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
<div className="w-16 h-16 rounded-full glass-ai flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-4xl" data-icon="play_arrow" data-weight="fill" style={{ 'fontVariationSettings': '\'FILL\' 1' }}>play_arrow</span>
</div>
</div>
<div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded">08:20</div>
</div>
<div className="p-md">
<div className="flex justify-between items-start mb-base">
<span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant px-2 py-0.5 border border-outline-variant rounded">Pro</span>
<span className="material-symbols-outlined text-on-surface-variant" data-icon="more_vert">more_vert</span>
</div>
<h5 className="font-label-bold text-md mb-xs">Heavy Equipment Frame Repair</h5>
<p className="text-body-sm text-on-surface-variant">Step-by-step structural welding for tractors and excavators.</p>
</div>
</div>
{/*  Video Card 3  */}
<div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden group">
<div className="relative h-48 overflow-hidden">
<img alt="Video Thumbnail" className="w-full h-full object-cover" data-alt="An overhead view of a clean, organized industrial workbench with various welding tools, blueprints, and a precision laser-cut steel piece. The lighting is bright and even, highlighting the metallic textures and the technical nature of fabrication. The color palette consists of slate greys, polished steels, and warm wood accents from the table." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAB9li6aiAdmzkC4DNdxY9qsrL4IWwiPXwAbK-lEgA9VJxTskww1NcK_c46vOmYSno5k_19WF9eRwU8cgzxmU80P7qma6jncX_vlysqrEMe0P8Kd1ZYTrhX-EWnPr8PNiILm2lam6xG8MnZTvbzPbXz7KcsFY1uD4ra19_gnrGkzAarbD1H6iJqgq-cOV5qLu0CQv76un29fKgWVYc3DWxfv1uBbAYDNmH0N3RuJHROn-de-cdNwmm33h46Sf3Nzks89sXtq0kngr2J"/>
<div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
<div className="w-16 h-16 rounded-full glass-ai flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-4xl" data-icon="play_arrow" data-weight="fill" style={{ 'fontVariationSettings': '\'FILL\' 1' }}>play_arrow</span>
</div>
</div>
<div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded">15:10</div>
</div>
<div className="p-md">
<div className="flex justify-between items-start mb-base">
<span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant px-2 py-0.5 border border-outline-variant rounded">Advanced</span>
<span className="material-symbols-outlined text-on-surface-variant" data-icon="more_vert">more_vert</span>
</div>
<h5 className="font-label-bold text-md mb-xs">Precision Aluminum Fabrication</h5>
<p className="text-body-sm text-on-surface-variant">Expert tips on heat control and gas selection for aluminum TIG welding.</p>
</div>
</div>
</div>
</section>
</main>

{/*  Floating Action Button Contextual (Scan Guide)  */}
<button onClick={() => navigate('/scanner')} className="fixed right-6 bottom-24 md:bottom-10 bg-primary text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40">
<span className="material-symbols-outlined" data-icon="photo_camera">photo_camera</span>
</button>
    </>
  );
}
