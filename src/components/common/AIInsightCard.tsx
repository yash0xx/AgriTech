import React from 'react';
import { Sparkles, ArrowRight, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

interface AIInsightCardProps {
  title?: string;
  insight: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'banner' | 'card' | 'compact' | 'market';
  confidenceScore?: number;
  className?: string;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  title = 'Market Intelligence Insight',
  insight,
  actionLabel,
  onAction,
  variant = 'card',
  confidenceScore = 94,
  className = ''
}) => {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-between gap-3 bg-[#E6F0E8] border border-[#9DF1C0] px-3.5 py-2.5 rounded-xl ${className}`}>
        <div className="flex items-center gap-2 text-xs text-[#002517] font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#0D6C45] shrink-0" />
          <span>{insight}</span>
        </div>
        {actionLabel && (
          <button
            onClick={onAction}
            className="text-xs font-bold text-[#0D6C45] hover:text-[#002517] underline decoration-[#0D6C45] underline-offset-2 shrink-0 transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-r from-[#002517] via-[#083A24] to-[#123B2A] text-white p-4 sm:p-5 rounded-2xl border border-[#9DF1C0]/20 shadow-md ${className}`}>
        {/* Subtle background glow */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#9DF1C0]/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#9DF1C0]/20 border border-[#9DF1C0]/30 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 text-[#9DF1C0]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-bold tracking-wider uppercase text-[#9DF1C0]">AI Crop Intelligence</span>
                <span className="text-[10px] bg-white/10 text-white/80 px-2 py-0.5 rounded-full">
                  AI-assisted estimate ({confidenceScore}% confidence)
                </span>
              </div>
              <p className="text-sm text-[#F7F5EF] leading-relaxed">
                {insight}
              </p>
            </div>
          </div>

          {actionLabel && (
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center gap-2 bg-[#9DF1C0] hover:bg-[#86E4AD] text-[#002517] font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0 whitespace-nowrap active:scale-95"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Default 'card' variant
  return (
    <div className={`bg-gradient-to-b from-[#F2FCF3] to-[#ECF6EE] border border-[#9DF1C0] p-4.5 rounded-2xl shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#9DF1C0] flex items-center justify-center text-[#002517]">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#002517]">{title}</h4>
        </div>
        <span className="text-[10px] font-semibold text-[#0D6C45] bg-white px-2 py-0.5 rounded-full border border-[#9DF1C0]/60">
          AI-assisted estimate
        </span>
      </div>

      <p className="text-xs sm:text-sm text-[#151E19] leading-relaxed mb-3">
        {insight}
      </p>

      {actionLabel && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D6C45] hover:text-[#002517] transition-colors"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
