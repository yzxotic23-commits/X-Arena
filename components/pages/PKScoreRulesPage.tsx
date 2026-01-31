'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';

type OpponentEffect = 'none' | 'decrease' | 'increase';

interface TrafficSourceItem {
  id: string;
  name: string;
  points: number;
  effect: OpponentEffect;
}

const OPPONENT_OPTIONS: { value: OpponentEffect; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'decrease', label: '- (Decrease)' },
  { value: 'increase', label: '+ (Increase)' },
];

const INITIAL_SCORE_RULES = {
  reactivationPoints: 10,
  recommendPoints: 5,
  activeMemberPoints: 2,
  reactivationOpponent: 'decrease' as OpponentEffect,
  recommendOpponent: 'decrease' as OpponentEffect,
  activeMemberOpponent: 'none' as OpponentEffect,
};

export function PKScoreRulesPage() {
  const { language } = useLanguage();
  const translations = t(language);

  // Saved snapshot (after Save or on load)
  const [savedScoreRules, setSavedScoreRules] = useState(INITIAL_SCORE_RULES);
  // Score Rules state (current form values)
  const [reactivationPoints, setReactivationPoints] = useState(savedScoreRules.reactivationPoints);
  const [recommendPoints, setRecommendPoints] = useState(savedScoreRules.recommendPoints);
  const [activeMemberPoints, setActiveMemberPoints] = useState(savedScoreRules.activeMemberPoints);
  const [reactivationOpponent, setReactivationOpponent] = useState<OpponentEffect>(savedScoreRules.reactivationOpponent);
  const [recommendOpponent, setRecommendOpponent] = useState<OpponentEffect>(savedScoreRules.recommendOpponent);
  const [activeMemberOpponent, setActiveMemberOpponent] = useState<OpponentEffect>(savedScoreRules.activeMemberOpponent);

  const isScoreRulesDirty =
    reactivationPoints !== savedScoreRules.reactivationPoints ||
    recommendPoints !== savedScoreRules.recommendPoints ||
    activeMemberPoints !== savedScoreRules.activeMemberPoints ||
    reactivationOpponent !== savedScoreRules.reactivationOpponent ||
    recommendOpponent !== savedScoreRules.recommendOpponent ||
    activeMemberOpponent !== savedScoreRules.activeMemberOpponent;

  const handleResetScoreRules = () => {
    setReactivationPoints(savedScoreRules.reactivationPoints);
    setRecommendPoints(savedScoreRules.recommendPoints);
    setActiveMemberPoints(savedScoreRules.activeMemberPoints);
    setReactivationOpponent(savedScoreRules.reactivationOpponent);
    setRecommendOpponent(savedScoreRules.recommendOpponent);
    setActiveMemberOpponent(savedScoreRules.activeMemberOpponent);
  };

  const handleSaveScoreRules = () => {
    const next = {
      reactivationPoints,
      recommendPoints,
      activeMemberPoints,
      reactivationOpponent,
      recommendOpponent,
      activeMemberOpponent,
    };
    setSavedScoreRules(next);
    // TODO: persist to API/localStorage
  };

  // Traffic Source: saved snapshot (after Save or on load)
  const [savedTrafficSources, setSavedTrafficSources] = useState<TrafficSourceItem[]>([]);
  // Hanya tampilkan Save & Cancel setelah user benar-benar edit (tambah/hapus source). Default false = tombol disembunyikan.
  const [trafficSourceRulesHasChanges, setTrafficSourceRulesHasChanges] = useState<boolean>(() => false);
  // Traffic Source form (for adding new)
  const [trafficSourceName, setTrafficSourceName] = useState('');
  const [trafficSourcePoints, setTrafficSourcePoints] = useState(0);
  const [trafficSourceEffect, setTrafficSourceEffect] = useState<OpponentEffect>('none');
  const [trafficSources, setTrafficSources] = useState<TrafficSourceItem[]>([]);

  const handleAddTrafficSource = () => {
    if (!trafficSourceName.trim()) return;
    setTrafficSources((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: trafficSourceName.trim(),
        points: trafficSourcePoints,
        effect: trafficSourceEffect,
      },
    ]);
    setTrafficSourceRulesHasChanges(true);
    setTrafficSourceName('');
    setTrafficSourcePoints(0);
    setTrafficSourceEffect('none');
  };

  const handleRemoveTrafficSource = (id: string) => {
    setTrafficSources((prev) => prev.filter((item) => item.id !== id));
    setTrafficSourceRulesHasChanges(true);
  };

  const handleSaveTrafficSourceRules = () => {
    setSavedTrafficSources(trafficSources.map((item) => ({ ...item })));
    setTrafficSourceRulesHasChanges(false);
    // TODO: persist to API/localStorage
  };

  const handleCancelTrafficSourceRules = () => {
    setTrafficSources(savedTrafficSources.map((item) => ({ ...item })));
    setTrafficSourceRulesHasChanges(false);
    setTrafficSourceName('');
    setTrafficSourcePoints(0);
    setTrafficSourceEffect('none');
  };

  const inputBase =
    'w-full px-3 py-2 text-sm rounded-md border border-card-border bg-primary/5 dark:bg-primary/10 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors';
  const labelBase = 'block text-sm font-medium text-foreground mb-1.5';

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Rules Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0 }}
          className="w-full"
        >
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
            <CardHeader className="relative z-10">
              <CardTitle className="font-heading flex items-center gap-2 text-primary">
                <TrendingUp className="w-5 h-5" />
                Score Rules
              </CardTitle>
              <p className="text-sm text-muted mt-1">
                Adjust scoring values for Reactivation / Recommend / Active Member.
              </p>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Points column */}
                <div className="space-y-4">
                  <div>
                    <label className={labelBase}>Reactivation Points</label>
                    <input
                      type="number"
                      min={0}
                      value={reactivationPoints}
                      onChange={(e) => setReactivationPoints(Number(e.target.value) || 0)}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className={labelBase}>Recommend Points</label>
                    <input
                      type="number"
                      min={0}
                      value={recommendPoints}
                      onChange={(e) => setRecommendPoints(Number(e.target.value) || 0)}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className={labelBase}>Active Member Points</label>
                    <input
                      type="number"
                      min={0}
                      value={activeMemberPoints}
                      onChange={(e) => setActiveMemberPoints(Number(e.target.value) || 0)}
                      className={inputBase}
                    />
                  </div>
                </div>
                {/* Opponent Effect column */}
                <div className="space-y-4">
                  <div>
                    <label className={labelBase}>Reactivation Opponent</label>
                    <select
                      value={reactivationOpponent}
                      onChange={(e) => setReactivationOpponent(e.target.value as OpponentEffect)}
                      className={inputBase}
                    >
                      {OPPONENT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelBase}>Recommend Opponent</label>
                    <select
                      value={recommendOpponent}
                      onChange={(e) => setRecommendOpponent(e.target.value as OpponentEffect)}
                      className={inputBase}
                    >
                      {OPPONENT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelBase}>Active Member Opponent</label>
                    <select
                      value={activeMemberOpponent}
                      onChange={(e) => setActiveMemberOpponent(e.target.value as OpponentEffect)}
                      className={inputBase}
                    >
                      {OPPONENT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              {isScoreRulesDirty && (
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-card-border">
                  <button
                    onClick={handleResetScoreRules}
                    className="inline-flex items-center justify-center rounded-md font-medium transition-colors h-10 px-4 py-2 bg-red-600 text-white hover:bg-red-700"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleSaveScoreRules}
                    className="inline-flex items-center justify-center rounded-md font-medium transition-colors h-10 px-4 py-2 bg-red-600 text-white hover:bg-red-700"
                  >
                    Save Score Rules
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Traffic Source Rules Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full"
        >
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
            <CardHeader className="relative z-10">
              <CardTitle className="font-heading flex items-center gap-2 text-primary">
                <TrendingUp className="w-5 h-5" />
                Traffic Source Rules
              </CardTitle>
              <p className="text-sm text-muted mt-1">
                Add Traffic Sources to modify base score. Points are added to reactivation score, Effect affects opponent points.
              </p>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className={labelBase}>Traffic Source Name</label>
                  <input
                    type="text"
                    placeholder="e.g., High Value"
                    value={trafficSourceName}
                    onChange={(e) => setTrafficSourceName(e.target.value)}
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className={labelBase}>Points</label>
                  <input
                    type="number"
                    min={0}
                    value={trafficSourcePoints}
                    onChange={(e) => setTrafficSourcePoints(Number(e.target.value) || 0)}
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className={labelBase}>Effect</label>
                  <select
                    value={trafficSourceEffect}
                    onChange={(e) => setTrafficSourceEffect(e.target.value as OpponentEffect)}
                    className={inputBase}
                  >
                    {OPPONENT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {(trafficSourceName.trim() !== '' || trafficSourcePoints !== 0 || trafficSourceEffect !== 'none') && (
                <div className="w-full flex justify-end gap-2 mt-4 pt-4 border-t border-card-border">
                  <button
                    onClick={() => {
                      setTrafficSourceName('');
                      setTrafficSourcePoints(0);
                      setTrafficSourceEffect('none');
                    }}
                    className="inline-flex items-center justify-center rounded-md font-medium transition-colors h-10 px-4 py-2 bg-red-600 text-white hover:bg-red-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTrafficSource}
                    className="inline-flex items-center justify-center rounded-md font-medium transition-colors h-10 px-4 py-2 bg-red-600 text-white hover:bg-red-700"
                  >
                    Save
                  </button>
                </div>
              )}

              {trafficSources.length > 0 && (
                <div className="mt-6 pt-4 border-t border-card-border">
                  <p className="text-sm font-medium text-foreground mb-3">Added sources</p>
                  <ul className="space-y-2">
                    {trafficSources.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-2 py-2 px-3 rounded-md bg-muted/50 dark:bg-muted/20 text-sm"
                      >
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted">
                          +{item.points} pts · {OPPONENT_OPTIONS.find((o) => o.value === item.effect)?.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTrafficSource(item.id)}
                          className="p-1.5 rounded hover:bg-destructive/20 text-muted hover:text-destructive transition-colors"
                          aria-label="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {trafficSourceRulesHasChanges && (
                <div className="w-full flex justify-end gap-2 mt-4 pt-4 border-t border-card-border">
                  <button
                    onClick={handleCancelTrafficSourceRules}
                    className="inline-flex items-center justify-center rounded-md font-medium transition-colors h-10 px-4 py-2 bg-red-600 text-white hover:bg-red-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTrafficSourceRules}
                    className="inline-flex items-center justify-center rounded-md font-medium transition-colors h-10 px-4 py-2 bg-red-600 text-white hover:bg-red-700"
                  >
                    Save
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
