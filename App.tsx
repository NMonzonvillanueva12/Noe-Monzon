
import React, { useState, useEffect } from 'react';
import { AppState, MoodResult } from './types';
import { analyzeMoodFromImage } from './services/geminiService';
import CameraView from './components/CameraView';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.SCANNING);
  const [result, setResult] = useState<MoodResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Focus on the center. We're finding products that match your energy.");

  useEffect(() => {
    let interval: any;
    if (state === AppState.ANALYZING) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.floor(Math.random() * 15);
        });
      }, 300);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [state]);

  const handleCapture = async (base64Image: string) => {
    setState(AppState.ANALYZING);
    setStatusText("Interpreting facial data patterns...");
    try {
      const moodResult = await analyzeMoodFromImage(base64Image);
      setResult(moodResult);
      setState(AppState.RESULT);
    } catch (err) {
      console.error(err);
      setStatusText("Error analyzing expression. Try again.");
      setState(AppState.SCANNING);
    }
  };

  const triggerScan = () => {
    const btn = document.getElementById('hidden-capture');
    btn?.click();
  };

  const reset = () => {
    setState(AppState.SCANNING);
    setResult(null);
    setStatusText("Focus on the center. We're finding products that match your energy.");
  };

  const showRecommendations = () => {
    setState(AppState.RECOMMENDATIONS);
  };

  const goBackToResult = () => {
    setState(AppState.RESULT);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background-dark overflow-hidden shadow-2xl">
      {/* Top App Bar */}
      <div className="z-50 flex items-center bg-transparent p-4 pb-2 justify-between">
        <div 
          className="text-white flex size-12 shrink-0 items-center justify-start cursor-pointer" 
          onClick={state === AppState.RECOMMENDATIONS ? goBackToResult : reset}
        >
          <span className="material-symbols-outlined">
            {state === AppState.SCANNING ? 'menu' : 'arrow_back'}
          </span>
        </div>
        <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          {state === AppState.RESULT ? 'Mood Analysis' : 
           state === AppState.RECOMMENDATIONS ? 'Recommendations' : 'Expression Scan'}
        </h2>
        <div className="flex w-12 items-center justify-end">
          <button className="flex max-w-[480px] cursor-pointer items-center justify-center rounded-lg h-12 bg-transparent text-white p-0">
            <span className="material-symbols-outlined">
              {state === AppState.RESULT || state === AppState.RECOMMENDATIONS ? 'share' : 'info'}
            </span>
          </button>
        </div>
      </div>

      {(state === AppState.SCANNING || state === AppState.ANALYZING) && (
        <>
          <CameraView onCapture={handleCapture} isScanning={state === AppState.SCANNING} />
          
          <div className="z-20 bg-background-dark/90 backdrop-blur-xl pt-6 pb-10 px-4 rounded-t-[2rem] border-t border-white/5">
            <h2 className="text-white tracking-light text-[24px] font-bold leading-tight px-4 text-center pb-1">
              {state === AppState.ANALYZING ? 'Processing profile...' : 'Reading your mood...'}
            </h2>
            <p className="text-white/60 text-sm font-normal leading-normal pb-4 px-8 text-center min-h-[40px]">
              {statusText}
            </p>

            <div className="flex flex-col gap-2 p-4">
              <div className="flex gap-6 justify-between items-center mb-1">
                <p className="text-primary text-sm font-medium leading-normal flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">psychology</span>
                  Emotional Mapping
                </p>
                <p className="text-white text-sm font-bold leading-normal">{progress}%</p>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-primary transition-all duration-300 ease-out shadow-[0_0_10px_rgba(244,192,37,0.6)]" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-8 mt-4">
              <button className="flex shrink-0 items-center justify-center rounded-full size-12 bg-white/5 border border-white/10 text-white hover:bg-white/10">
                <span className="material-symbols-outlined">image</span>
              </button>
              <button 
                onClick={triggerScan}
                disabled={state === AppState.ANALYZING}
                className={`flex shrink-0 items-center justify-center rounded-full size-20 bg-primary text-background-dark transition-all ${state === AppState.ANALYZING ? 'opacity-50 scale-90' : 'glow-button active:scale-95'}`}
              >
                <span className="material-symbols-outlined !text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  photo_camera
                </span>
              </button>
              <button className="flex shrink-0 items-center justify-center rounded-full size-12 bg-white/5 border border-white/10 text-white hover:bg-white/10">
                <span className="material-symbols-outlined">sync</span>
              </button>
            </div>
          </div>
        </>
      )}

      {state === AppState.RESULT && (
        <div className="flex-1 flex flex-col items-center px-4 py-8 animate-in fade-in zoom-in duration-500 overflow-y-auto">
          <div className="w-full max-w-[320px]">
            <div className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden rounded-full aspect-square bg-gradient-to-tr from-primary/20 to-primary/40 p-4 shadow-2xl border-4 border-primary/20">
              <img 
                src={result?.avatarUrl || "https://picsum.photos/400/400?grayscale"} 
                alt="Avatar" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>

          <div className="mt-12 text-center max-w-sm">
            <div className="flex justify-center gap-2 mb-4">
              {result?.tags.map((tag, idx) => (
                <span key={idx} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-primary/20">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-white tracking-light text-[32px] font-bold leading-tight px-4 pb-3">
              {result?.mood}
            </h1>
            <p className="text-white/80 text-base font-normal leading-relaxed px-8">
              {result?.description}
            </p>
          </div>

          <div className="w-full max-w-sm px-4 py-8 mt-4">
            <button 
              onClick={showRecommendations}
              className="glow-button flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 bg-primary text-[#181611] text-lg font-bold transition-transform active:scale-95"
            >
              <span className="truncate">See Recommendations</span>
              <span className="material-symbols-outlined ml-2">trending_up</span>
            </button>
          </div>

          <div className="mt-2 flex gap-6">
            <button 
              onClick={reset}
              className="flex items-center justify-center p-4 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">refresh</span>
            </button>
            <button className="flex items-center justify-center p-4 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors">
              <span className="material-symbols-outlined">favorite</span>
            </button>
          </div>
        </div>
      )}

      {state === AppState.RECOMMENDATIONS && (
        <div className="flex-1 flex flex-col px-4 py-4 animate-in slide-in-from-right duration-500 overflow-y-auto">
          <div className="mb-6 px-2">
            <p className="text-white/40 text-sm font-medium uppercase tracking-[0.2em] mb-1">Curation based on your {result?.mood} mood</p>
            <h3 className="text-white text-2xl font-bold">Picks for you</h3>
          </div>

          <div className="space-y-4 pb-12">
            {result?.recommendations.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-primary text-[10px] font-bold uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded border border-primary/20 mb-2 inline-block">
                      {item.category}
                    </span>
                    <h4 className="text-white text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                      {item.name}
                    </h4>
                  </div>
                  <span className="text-white font-bold text-lg">{item.price}</span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-4">
                  {item.reason}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-background-dark bg-gray-700 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?u=${item.name}${i}`} alt="user" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <span className="text-[10px] text-white/40 flex items-center pl-4 font-medium">+120 others like this</span>
                  </div>
                  <button className="flex items-center justify-center bg-primary/10 text-primary rounded-full size-8 hover:bg-primary hover:text-background-dark transition-all">
                    <span className="material-symbols-outlined text-sm">shopping_cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-auto pt-4 border-t border-white/5">
            <button 
              onClick={reset}
              className="w-full py-4 text-white/60 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors"
            >
              Scan Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
