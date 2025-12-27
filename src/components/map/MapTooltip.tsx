import { Badge } from '@/components/ui/badge';
import { MapPin, School, Users, CheckCircle, AlertCircle } from 'lucide-react';

const MapTooltip = ({ data }: { data: any | null }) => {
  if (!data) return null;

  return (
    <div 
      className="absolute z-50 pointer-events-none transition-all duration-200" 
      style={{ 
        left: data.x + 15, 
        top: data.y - 10,
        animation: 'fadeIn 0.2s ease-in-out'
      }}
    >
      <div className="bg-white border-2 border-slate-200 rounded-xl shadow-2xl px-4 py-3 min-w-[260px] max-w-[320px] backdrop-blur-md">
        
        {data.isSchool ? (
          /* SCHOOL PIN DETAILED VIEW */
          <div className="space-y-3">
            <div className="border-b pb-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-100 rounded-md">
                  <School className="w-4 h-4 text-blue-600" />
                </div>
                <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-tight bg-blue-50 text-blue-700 border-blue-200">
                  School
                </Badge>
              </div>
              <h4 className="font-bold text-sm text-slate-800 leading-tight line-clamp-2">
                {data.name}
              </h4>
              {data.schoolDetails?.udise && (
                <p className="text-[10px] text-slate-500 font-mono mt-1">
                  UDISE: {data.schoolDetails.udise}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Student Enrollment */}
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-semibold">Students</span>
                  <span className="font-bold text-slate-800">{data.schoolDetails?.students_enrolled || 'N/A'}</span>
                </div>
              </div>

              {/* Category */}
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-semibold">Category</span>
                  <span className="font-bold text-slate-800">{data.schoolDetails?.category || 'Primary'}</span>
                </div>
              </div>

              {/* Visit Status */}
              <div className="col-span-2 border-t pt-2 mt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {data.schoolDetails?.visit_status === 'visited' ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Status</span>
                  </div>
                  <Badge 
                    variant={data.schoolDetails?.visit_status === 'visited' ? 'default' : 'secondary'}
                    className={`text-[9px] ${
                      data.schoolDetails?.visit_status === 'visited' 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-amber-100 text-amber-700 border-amber-200'
                    }`}
                  >
                    {data.schoolDetails?.visit_status === 'visited' ? 'Visited' : 'Pending'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* REGION SUMMARY VIEW */
          <div className="space-y-2">
            <div className="flex justify-between items-start border-b pb-2">
              <div className="flex-1">
                <h4 className="font-bold text-sm text-slate-800 capitalize">{data.name}</h4>
                {data.area_sqkm > 0 && (
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Area: {data.area_sqkm.toLocaleString()} km²
                  </p>
                )}
              </div>
            </div>

            {data.achievement !== undefined ? (
              <div className="space-y-2 text-xs">
                {/* Achievement */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Achievement</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400 rounded-full transition-all"
                        style={{ width: `${Math.min(data.achievement, 100)}%` }}
                      />
                    </div>
                    <span className="font-bold text-slate-800 min-w-[40px] text-right">
                      {data.achievement?.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Visits */}
                {data.visits !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Visits</span>
                    <span className="font-bold text-slate-800">{data.visits}</span>
                  </div>
                )}

                {/* BAC Count */}
                {data.bac_count !== undefined && (
                  <div className="flex justify-between items-center pt-1 border-t">
                    <span className="text-slate-600 text-[10px]">Active BACs</span>
                    <Badge variant="secondary" className="text-[9px] font-bold">
                      {data.bac_count}
                    </Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-2">
                <p className="text-[10px] text-amber-600 italic flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  No visit data for this region
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapTooltip;