
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Star } from 'lucide-react';

export default function Paywall({ title, bullets, cta }) {
  const defaultBullets = [
    "Time Capsule lookbacks",
    "Export to PDF/CSV",
    "Cloud sync across devices",
    "Daily Spark theme packs",
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto py-12 px-4 text-center"
    >
      <Card className="bg-white/70 shadow-2xl">
        <CardHeader>
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-serif text-gray-800">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-left my-8">
            {(bullets || defaultBullets).map((bullet, i) => (
              <li key={i} className="flex items-start gap-3">
                <Star className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">{bullet}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold py-3 text-lg rounded-lg shadow-lg hover:shadow-xl transition-transform transform hover:scale-105">
            {cta || "Unlock Premium"}
          </Button>
          <p className="text-xs text-gray-500 mt-4">$0.99/month · Cancel anytime</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
