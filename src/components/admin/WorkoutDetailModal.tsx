import { X } from "lucide-react";

interface Props {
  workout: any;
  onClose: () => void;
}

const WorkoutDetailModal = ({ workout, onClose }: Props) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-sky-500 to-cyan-500 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-black mb-1">{workout.type}</h2>
              <p className="text-sky-100">{workout.traineeName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-3">
            {workout.exercises?.map((ex: any, idx: number) => (
              <div key={idx} className="border-2 border-slate-200 rounded-2xl p-5 hover:border-sky-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    {ex.isSuperSet && (
                      <span className="inline-block text-xs font-bold px-3 py-1 bg-sky-100 text-sky-700 rounded-lg mb-2">
                        SUPER-SET
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-slate-900 mb-3">
                      {ex.isSuperSet && ex.superSetExercises ? (
                        <div className="space-y-1">
                          {ex.superSetExercises.map((name: string, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-sky-500">•</span>
                              {name}
                            </div>
                          ))}
                        </div>
                      ) : (
                        ex.altName || ex.name
                      )}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">סטים:</span>
                        <span className="font-bold text-slate-900">{ex.sets}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">חזרות:</span>
                        <span className="font-bold text-slate-900">{ex.reps}</span>
                      </div>
                      {ex.weight && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">משקל:</span>
                          <span className="font-bold text-sky-600">
                            {ex.weight.includes('|') ? ex.weight.split('|').join(' / ') : ex.weight}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetailModal;
