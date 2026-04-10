import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Zap, 
  Droplet, 
  Map as RoadIcon, 
  Trash2, 
  MoreHorizontal,
  ArrowUpRight
} from "lucide-react";
import { cn } from "../../lib/utils";

const categories = [
  {
    id: 1,
    title: "Electricity",
    icon: Zap,
    color: "bg-amber-500",
    lightColor: "bg-amber-50",
    textColor: "text-amber-700",
    category: "electricity",
    description: "Power outages, faulty wiring, or street light issues."
  },
  {
    id: 2,
    title: "Plumbing",
    icon: Droplet,
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    textColor: "text-blue-700",
    category: "plumbing",
    description: "Water leaks, drainage blocks, or pipe repairs."
  },
  {
    id: 3,
    title: "Roads",
    icon: RoadIcon,
    color: "bg-orange-500",
    lightColor: "bg-orange-50",
    textColor: "text-orange-700",
    category: "road",
    description: "Potholes, broken pavements, or road obstructions."
  },
  {
    id: 4,
    title: "Sanitation",
    icon: Trash2,
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    category: "cleaning",
    description: "Garbage collection or community cleaning needs."
  },
  {
    id: 5,
    title: "Other",
    icon: MoreHorizontal,
    color: "bg-slate-500",
    lightColor: "bg-slate-50",
    textColor: "text-slate-700",
    category: "other",
    description: "Any other civic issues that need attention."
  },
];

const CategoryGrid = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (selectedCategory) => {
    navigate(`/report?category=${selectedCategory}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((item, idx) => (
        <motion.button
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          whileHover={{ translateY: -5 }}
          onClick={() => handleCategoryClick(item.category)}
          className={cn(
            "group relative overflow-hidden rounded-[2rem] p-8 text-left transition-all duration-300 border border-transparent hover:border-white/50 hover:shadow-2xl shadow-sm",
            item.lightColor
          )}
        >
          <div className="flex justify-between items-start mb-6">
            <div className={cn("p-4 rounded-2xl text-white shadow-lg", item.color)}>
              <item.icon size={28} />
            </div>
            <div className="p-2 rounded-full bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight size={20} className={item.textColor} />
            </div>
          </div>
          
          <h3 className={cn("text-2xl font-bold mb-2 tracking-tight", item.textColor)}>
            {item.title}
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            {item.description}
          </p>
          
          <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
            Report Issue Now
          </div>
          
          {/* Decorative background element */}
          <div className={cn(
            "absolute -right-8 -bottom-8 rounded-full blur-3xl opacity-20 w-32 h-32 transition-transform duration-500 group-hover:scale-150",
            item.color
          )} />
        </motion.button>
      ))}
    </div>
  );
};

export default CategoryGrid;