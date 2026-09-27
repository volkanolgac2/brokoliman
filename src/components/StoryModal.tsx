import React from 'react';
import { X, Heart, Shield, Skull } from 'lucide-react';

interface StoryModalProps {
  onClose: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📖</span>
            <div>
              <h2 className="text-xl font-black text-white">Hikâye ve Karakterler</h2>
              <p className="text-xs text-emerald-400">Brokoli Kahraman'ın Destansı Macerası</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 text-sm leading-relaxed text-slate-200">
            <p className="font-semibold mb-2 text-emerald-300">
              🌱 Sebzelerin Huzurlu Dünyası Tehdit Altında!
            </p>
            <p>
              Bir zamanlar meyve ve sebzelerin huzur içinde yaşadığı rengârenk bir dünya vardı. Bu dünyanın kahramanı, cesur ve kararlı <strong className="text-emerald-400">Brokoli Adam</strong>'dı. En değer verdiği kişi ise onun canından çok sevdiği kız arkadaşı <strong className="text-amber-400">Havuç</strong>'tu.
            </p>
            <p className="mt-2">
              Fakat karanlık bir plan yapan kötü güçler ortaya çıktı: <strong className="text-rose-400">Ketçap, Hardal ve Mayonez</strong>. Bu üçlü, acımasız hükümdarları <strong className="text-red-500">Hamburger Kral</strong>'ın emriyle sebzeleri birer birer kaçırdı, onları fabrikalarındaki kafeslere kapattı ve Havuç'u da esir aldı!
            </p>
            <p className="mt-2">
              Brokoli Adam, Havuç'u ve dostlarını kurtarmak için 5 büyük dünyadan geçmek zorunda: kilitli kapılar, gizli geçitler, hareketli platformlar, ağırlık plakaları ve dev patronlar onu bekliyor!
            </p>
          </div>

          {/* Heroes Section */}
          <div>
            <h3 className="text-sm font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5 mb-3">
              <Shield size={16} /> Kahramanlarımız
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-3.5 flex items-center gap-3">
                <img
                  src="/assets/brokoli/02_characters/brokoli_kahraman.png"
                  alt="Brokoli"
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <h4 className="font-black text-white text-base">Brokoli Adam</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Kırmızı pelerinli, altın kemer tokalı cesur sebze kahramanı. Süper zıplama ve yaprak vuruşuyla dostlarını kurtarır!
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-3.5 flex items-center gap-3">
                <img
                  src="/assets/brokoli/02_characters/havuc_kiz_arkadas.png"
                  alt="Havuç"
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-black text-white text-base">Havuç</h4>
                    <Heart size={14} className="text-rose-400 fill-rose-400" />
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Brokoli'nin sevimli kız arkadaşı. Hamburger Kral tarafından kalenin en yüksek kulesine kaçırıldı.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Villains Section */}
          <div>
            <h3 className="text-sm font-black uppercase text-rose-400 tracking-wider flex items-center gap-1.5 mb-3">
              <Skull size={16} /> Kötü Güçler (Patronlar)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-rose-950/20 border border-rose-500/40 rounded-2xl p-3.5 flex items-center gap-3 sm:col-span-2">
                <img
                  src="/assets/brokoli/03_enemies_bosses/hamburger_krali.png"
                  alt="Hamburger Kral"
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-rose-300 text-base">Hamburger Kral</h4>
                    <span className="text-[10px] bg-rose-500/30 text-rose-200 px-2 py-0.5 rounded-full font-bold">
                      FİNAL BOSS
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Fast-food imparatorluğunun dev hükümdarı. Altın tacı ve kraliyet peleriniyle minyonları yönetir.
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-3 flex items-center gap-2.5">
                <img
                  src="/assets/brokoli/03_enemies_bosses/ketcap.png"
                  alt="Ketçap"
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">Ketçap (1. Dünya)</h4>
                  <p className="text-[11px] text-slate-400">Hızlı, öfkeli ve sıçrayan sos topları atar.</p>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-3 flex items-center gap-2.5">
                <img
                  src="/assets/brokoli/03_enemies_bosses/hardal.png"
                  alt="Hardal"
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">Hardal (2. Dünya)</h4>
                  <p className="text-[11px] text-slate-400">Zemini kayganlaştırır ve dalgalarla saldırır.</p>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-3 flex items-center gap-2.5">
                <img
                  src="/assets/brokoli/03_enemies_bosses/mayonez.png"
                  alt="Mayonez"
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">Mayonez (3. Dünya)</h4>
                  <p className="text-[11px] text-slate-400">Ağır kavanoz ezmesi ve yapışkan yavaşlatıcı bölgeler.</p>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-3 flex items-center gap-2.5">
                <img
                  src="/assets/brokoli/03_enemies_bosses/ketcap.png"
                  alt="Muhafız"
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">Sos Muhafızı (4. Dünya)</h4>
                  <p className="text-[11px] text-slate-400">Üç sosu birleştiren devasa buharlı kombo robot.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-extrabold text-white cursor-pointer active:scale-95 transition-all"
          >
            Anladım, Haydi Oynayalım!
          </button>
        </div>
      </div>
    </div>
  );
};
