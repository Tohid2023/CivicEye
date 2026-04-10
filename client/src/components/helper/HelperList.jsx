import React from "react";
import HelperCard from "./HelperCard";
import { motion, AnimatePresence } from "framer-motion";
import { SearchX } from "lucide-react";

const HelperList = ({ helpers }) => {
  if (!helpers || helpers.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[2rem] p-12 text-center shadow-xl border-white/50 border"
      >
        <SearchX className="mx-auto text-slate-300 mb-4" size={48} />
        <p className="text-xl font-bold text-slate-800">
          No helpers found nearby
        </p>
        <p className="text-sm text-slate-500 mt-2 font-medium">
          Try expanding your search radius or selecting a diferentes category.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      <AnimatePresence mode="popLayout">
        {helpers.map((helper, idx) => (
          <motion.div
            key={helper._id || helper.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.05 } }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <HelperCard helper={helper} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default HelperList;