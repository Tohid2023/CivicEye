import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { getBookingById } from "../services/bookingService";
import { useAuth } from "../context/AuthContext";
import ChatWindow from "../components/common/ChatWindow";
import { motion } from "framer-motion";
import {
  MapPin,
  User,
  Phone,
  ShieldCheck,
  Calendar,
  Clock,
  Loader2,
  Navigation,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Info,
  MessageSquare,
} from "lucide-react";
import { cn } from "../lib/utils";

// Session storage helpers for geocoding caching
const getCachedCoordinates = (address) => {
  if (!address) return null;
  try {
    const cached = sessionStorage.getItem(`geocode_${address}`);
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    console.error("[LiveTracking] Error reading from geocode cache:", err);
    return null;
  }
};

const setCachedCoordinates = (address, coords) => {
  if (!address || !coords) return;
  try {
    sessionStorage.setItem(`geocode_${address}`, JSON.stringify(coords));
  } catch (err) {
    console.error("[LiveTracking] Error writing to geocode cache:", err);
  }
};

const LiveTracking = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuth();
 
  // Booking details state
  const [booking, setBooking] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [bookingError, setBookingError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Leaflet CDN dynamic loading state
  const [leafletReady, setLeafletReady] = useState(false);
  const [leafletError, setLeafletError] = useState(null);

  // Map elements refs and state
  const [mapContainer, setMapContainer] = useState(null);
  const mapRef = useRef(null);
  const markersGroupRef = useRef(null);

  // Resolved destination location (Null Island check)
  const [resolvedIssueLoc, setResolvedIssueLoc] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState(null);

  // Browser/User Geolocation state (Safari safe watchPosition)
  const [currentUserLoc, setCurrentUserLoc] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const watchIdRef = useRef(null);

  // 1. Fetch Booking Details
  const fetchBookingDetails = async () => {
    try {
      setBookingLoading(true);
      setBookingError(null);
      const data = await getBookingById(bookingId);
      if (data && data.booking) {
        setBooking(data.booking);
      } else {
        setBookingError("Booking details were not returned from the server.");
      }
    } catch (err) {
      console.error("[LiveTracking] Error fetching booking details:", err);
      setBookingError(
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch booking details. Please try again."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  // 2. Dynamically Load Leaflet Assets
  useEffect(() => {
    if (window.L) {
      setLeafletReady(true);
      return;
    }

    try {
      // Append Leaflet CSS
      let link = document.getElementById("leaflet-css");
      if (!link) {
        link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Append Leaflet Script
      let script = document.getElementById("leaflet-script");
      if (!script) {
        script = document.createElement("script");
        script.id = "leaflet-script";
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        script.onload = () => {
          if (window.L) {
            setLeafletReady(true);
          } else {
            setLeafletError("Leaflet object is undefined after script load.");
          }
        };
        script.onerror = () => {
          setLeafletError("Failed to download Leaflet assets.");
        };
        document.body.appendChild(script);
      } else {
        // Wait if already loading
        const checkL = setInterval(() => {
          if (window.L) {
            setLeafletReady(true);
            clearInterval(checkL);
          }
        }, 100);
        setTimeout(() => {
          clearInterval(checkL);
          if (!window.L) {
            setLeafletError("Timeout waiting for Leaflet CDN assets.");
          }
        }, 10000);
      }
    } catch (err) {
      console.error("[LiveTracking] Uncaught exception loading Leaflet CDN:", err);
      setLeafletError(err.message || "Failed to load mapping engine.");
    }
  }, []);

  // 3. Safari Geolocation Safety (watchPosition)
  useEffect(() => {
    if (typeof window === "undefined" || !navigator?.geolocation) {
      setGeoError("Browser does not support geolocation tracking.");
      return;
    }

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          try {
            setCurrentUserLoc({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
            setGeoError(null);
          } catch (innerErr) {
            console.error("[LiveTracking] Error extracting GPS position:", innerErr);
          }
        },
        (error) => {
          console.error("[LiveTracking] Geolocation watch error:", error);
          // 1: Permission Denied, 2: Position Unavailable, 3: Timeout
          let errorMsg = "Unable to fetch location.";
          if (error.code === 1) {
            errorMsg = "Location access blocked by browser settings.";
          } else if (error.code === 3) {
            errorMsg = "Location request timed out.";
          }
          setGeoError(errorMsg);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0
        }
      );
    } catch (err) {
      console.error("[LiveTracking] Uncaught synchronous geolocation error:", err);
      setGeoError("Failed to initialize location watch listener.");
    }

    return () => {
      try {
        if (watchIdRef.current !== null && navigator?.geolocation) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }
      } catch (err) {
        console.error("[LiveTracking] Error clearing geolocation watch:", err);
      }
    };
  }, []);

  // 4. Null Island Protection and Geocoding (booking.issue.address)
  useEffect(() => {
    if (!booking) return;

    const address = booking?.issue?.address;
    const initialLat = Number(booking?.issue?.location?.latitude ?? 0);
    const initialLng = Number(booking?.issue?.location?.longitude ?? 0);

    const isNullIsland = initialLat === 0 && initialLng === 0;

    if (!isNullIsland) {
      setResolvedIssueLoc({ latitude: initialLat, longitude: initialLng });
      setGeocodingError(null);
      return;
    }

    if (!address) {
      console.warn("[LiveTracking] Null Island detected but no address available to geocode.");
      setResolvedIssueLoc({ latitude: 0, longitude: 0 });
      setGeocodingError("Invalid coordinates and no address provided.");
      return;
    }

    // Check Cache
    const cached = getCachedCoordinates(address);
    if (cached) {
      console.info("[LiveTracking] Retrieving geocoding from cache:", address, cached);
      setResolvedIssueLoc(cached);
      setGeocodingError(null);
      return;
    }

    // Fetch from OpenStreetMap Nominatim
    const geocodeAddress = async () => {
      try {
        setGeocoding(true);
        setGeocodingError(null);
        console.info("[LiveTracking] Initiating Nominatim geocode for address:", address);
        
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
        const response = await fetch(url, {
          headers: {
            "User-Agent": "CivicEye-Live-Tracking-Upgrade-Module"
          }
        });

        if (!response.ok) {
          throw new Error(`Nominatim API returned HTTP status ${response.status}`);
        }

        const data = await response.json();
        if (data && data.length > 0) {
          const resolved = {
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon)
          };
          console.info("[LiveTracking] Nominatim resolved coordinates:", resolved);
          setCachedCoordinates(address, resolved);
          setResolvedIssueLoc(resolved);
        } else {
          console.warn("[LiveTracking] Nominatim resolved 0 results for:", address);
          setResolvedIssueLoc({ latitude: 0, longitude: 0 });
          setGeocodingError("Address could not be pin-pointed. Showing default map.");
        }
      } catch (err) {
        console.error("[LiveTracking] Geocoding API failed:", err);
        setResolvedIssueLoc({ latitude: 0, longitude: 0 });
        setGeocodingError("Geocoding service error. Showing default map.");
      } finally {
        setGeocoding(false);
      }
    };

    geocodeAddress();
  }, [booking]);

  // 5. Drawing Markers helper function wrapped in Try-Catch
  const drawMarkersAndFitBounds = () => {
    try {
      const L = window.L;
      const map = mapRef.current;
      const group = markersGroupRef.current;
      if (!L || !map || !group) return;

      // Safe clean up of previous layers
      group.clearLayers();

      const bounds = [];

      // Helper Marker
      const helperLat = Number(booking?.helper?.location?.latitude ?? 0);
      const helperLng = Number(booking?.helper?.location?.longitude ?? 0);
      if (helperLat !== 0 || helperLng !== 0) {
        const helperIcon = L.icon({
          iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        L.marker([helperLat, helperLng], { icon: helperIcon })
          .addTo(group)
          .bindPopup(`
            <div style="font-family: sans-serif; font-size: 13px;">
              <strong style="color: #2563eb;">Helper Profile</strong><br/>
              <b>Name:</b> ${booking?.helper?.fullName || "Professional"}<br/>
              <b>Phone:</b> ${booking?.helper?.phone || "N/A"}<br/>
              <b>Specialty:</b> ${booking?.helper?.category || "Helper"}
            </div>
          `);
        
        bounds.push([helperLat, helperLng]);
      }

      // Resolved Issue Location Marker
      const issueLat = resolvedIssueLoc?.latitude;
      const issueLng = resolvedIssueLoc?.longitude;
      if (issueLat !== undefined && issueLng !== undefined && (issueLat !== 0 || issueLng !== 0)) {
        const issueIcon = L.icon({
          iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        L.marker([issueLat, issueLng], { icon: issueIcon })
          .addTo(group)
          .bindPopup(`
            <div style="font-family: sans-serif; font-size: 13px;">
              <strong style="color: #dc2626;">Reported Problem</strong><br/>
              <b>Category:</b> ${booking?.issue?.category || "Service"}<br/>
              <b>Location:</b> ${booking?.issue?.address || "N/A"}<br/>
              <b>Status:</b> ${booking?.status || "Active"}
            </div>
          `);
        
        bounds.push([issueLat, issueLng]);
      }

      // User Marker (Safely check user GPS tracking)
      const userLat = currentUserLoc?.latitude;
      const userLng = currentUserLoc?.longitude;
      if (userLat !== undefined && userLng !== undefined) {
        const userIcon = L.icon({
          iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        L.marker([userLat, userLng], { icon: userIcon })
          .addTo(group)
          .bindPopup(`
            <div style="font-family: sans-serif; font-size: 13px;">
              <b>Your GPS Location</b>
            </div>
          `);
        
        bounds.push([userLat, userLng]);
      }

      // Zoom map to fit both locations
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      }

    } catch (err) {
      console.error("[LiveTracking] Error drawing map markers:", err);
    }
  };

  // 6. Callback Ref Map Initialization
  useEffect(() => {
    if (!mapContainer || !leafletReady || !resolvedIssueLoc || !booking) return;

    try {
      const L = window.L;
      if (!L) return;

      // Clean up previous map instance safely
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.error("[LiveTracking] Exception during redundant map cleanup:", e);
        }
        mapRef.current = null;
      }

      // Pick center coordinates
      const helperLat = Number(booking?.helper?.location?.latitude ?? 0);
      const helperLng = Number(booking?.helper?.location?.longitude ?? 0);
      const centerLat = (helperLat !== 0 || helperLng !== 0) ? helperLat : resolvedIssueLoc.latitude;
      const centerLng = (helperLat !== 0 || helperLng !== 0) ? helperLng : resolvedIssueLoc.longitude;

      console.info("[LiveTracking] Initializing map element container. Center:", [centerLat, centerLng]);
      
      const map = L.map(mapContainer).setView([centerLat, centerLng], 14);
      mapRef.current = map;

      // Add Tile Layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Create Layer Group for markers
      markersGroupRef.current = L.layerGroup().addTo(map);

      // Initial draw
      drawMarkersAndFitBounds();

    } catch (err) {
      console.error("[LiveTracking] Leaflet initialization crash prevented:", err);
    }

    return () => {
      try {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
          console.info("[LiveTracking] Successfully disposed Leaflet map instance.");
        }
      } catch (err) {
        console.error("[LiveTracking] Leaflet map unmount cleanup error:", err);
      }
    };
  }, [mapContainer, leafletReady, resolvedIssueLoc, booking]);

  // 7. Redraw Markers when Locations Change
  useEffect(() => {
    drawMarkersAndFitBounds();
  }, [
    booking?.helper?.location?.latitude,
    booking?.helper?.location?.longitude,
    resolvedIssueLoc,
    currentUserLoc
  ]);

  return (
    <div className="bg-mesh min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 pt-28 pb-20">
        {/* Back and Page Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={() => navigate("/my-bookings")}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-sm transition self-start bg-white/60 border border-white/50 px-4 py-2 rounded-2xl shadow-sm backdrop-blur-md"
          >
            <ArrowLeft size={16} />
            Back to Bookings
          </button>
          
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Navigation className="text-blue-600 animate-pulse" size={28} />
            Live Tracking
          </h1>
        </div>

        {/* Global Loading state */}
        {bookingLoading ? (
          <div className="glass rounded-[2rem] p-16 text-center shadow-lg border-white/50 flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="text-lg font-bold text-slate-700">Loading booking records...</p>
            <p className="text-sm text-slate-400 mt-2">Retrieving real-time dispatch data</p>
          </div>
        ) : bookingError ? (
          <div className="glass rounded-[2rem] p-12 text-center shadow-lg border-white/50 min-h-[400px] flex flex-col items-center justify-center">
            <AlertTriangle className="text-red-500 mb-4" size={54} />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Failed to load tracking</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-6">{bookingError}</p>
            <button
              onClick={fetchBookingDetails}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-bold transition"
            >
              <RefreshCw size={16} />
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Map Container Column */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="glass rounded-[2.5rem] p-4 border border-white/60 shadow-xl bg-white/70 backdrop-blur-xl flex-1 flex flex-col relative overflow-hidden min-h-[450px]">
                {leafletError && (
                  <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-white rounded-3xl p-8 max-w-sm shadow-2xl border border-red-100">
                      <AlertTriangle className="text-red-500 mx-auto mb-4" size={40} />
                      <h3 className="text-lg font-bold text-slate-900">Map Loading Error</h3>
                      <p className="text-slate-500 text-sm mt-2 mb-4">{leafletError}</p>
                    </div>
                  </div>
                )}

                {geocoding && (
                  <div className="absolute top-6 left-6 z-20 bg-white/95 px-4 py-2.5 rounded-2xl border border-blue-100 shadow-lg flex items-center gap-2.5 text-xs font-bold text-blue-700 animate-pulse">
                    <Loader2 size={14} className="animate-spin" />
                    Resolving Destination Address...
                  </div>
                )}

                {/* Map Display DIV (Callback ref registered) */}
                <div
                  ref={setMapContainer}
                  className="w-full flex-1 rounded-[1.8rem] border border-slate-100 shadow-inner bg-slate-50 overflow-hidden z-10"
                  style={{ height: "100%", minHeight: "450px" }}
                />
                
                {/* Geolocation Alerts Overlay */}
                {geoError && (
                  <div className="mt-3 flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-100 rounded-2xl text-amber-800 text-xs font-semibold z-20">
                    <Info size={16} className="text-amber-500 shrink-0" />
                    <span>Your Location: {geoError} Your device is not shown on the map.</span>
                  </div>
                )}
                {geocodingError && (
                  <div className="mt-3 flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-2xl text-blue-800 text-xs font-semibold z-20">
                    <Info size={16} className="text-blue-500 shrink-0" />
                    <span>Destination Geocode: {geocodingError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Details Column */}
            <div className="lg:col-span-4 flex flex-col">
              {isChatOpen ? (
                <ChatWindow bookingId={bookingId} onClose={() => setIsChatOpen(false)} />
              ) : (
                <div className="space-y-6 w-full">
                  {/* Dispatch Info Card */}
                  <div className="glass p-6 rounded-[2.5rem] border border-white/60 bg-white/70 backdrop-blur-xl shadow-xl space-y-6">
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 border border-blue-200 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-blue-700">
                        Active Dispatch
                      </span>
                      <h2 className="text-2xl font-black text-slate-900 mt-2 capitalize">
                        {booking?.issue?.category || "Service Issue"}
                      </h2>
                      <p className="text-slate-500 text-sm font-medium mt-1">
                        Booking Reference: {booking?._id}
                      </p>
                    </div>

                    <div className="border-t border-slate-200/50 pt-4 space-y-4 text-sm font-semibold">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Preferred Date</p>
                          <p className="text-slate-800">{booking?.preferredDate || "Not Specified"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
                          <Clock size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Arrival Time</p>
                          <p className="text-slate-800">{booking?.preferredTime || "Not Specified"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                          <MapPin size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Service Destination</p>
                          <p className="text-slate-800 break-words">{booking?.issue?.address || "No address provided"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Info Card (Helper or Citizen depending on role) */}
                  <div className="glass p-6 rounded-[2.5rem] border border-white/60 bg-white/70 backdrop-blur-xl shadow-xl space-y-5">
                    {authUser?.role === "helper" ? (
                      <>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Citizen Contact Details
                        </h3>

                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-100">
                            <User size={26} />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-slate-900">
                              {booking?.user?.fullName || "Community Member"}
                            </h4>
                            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mt-0.5">
                              Citizen / Reporter
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-slate-200/50">
                          <a
                            href={`tel:${booking?.user?.phone}`}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all"
                          >
                            <Phone size={16} />
                            Call Citizen
                          </a>
                          <button
                            onClick={() => setIsChatOpen(true)}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                          >
                            <MessageSquare size={16} />
                            Chat with Citizen
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Assigned Helper Details
                        </h3>

                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-100">
                            <User size={26} />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-slate-900">
                              {booking?.helper?.fullName || "Professional Specialist"}
                            </h4>
                            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mt-0.5">
                              {booking?.helper?.category || "Specialist"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-slate-200/50">
                          <a
                            href={`tel:${booking?.helper?.phone}`}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all"
                          >
                            <Phone size={16} />
                            Call Helper
                          </a>
                          <button
                            onClick={() => setIsChatOpen(true)}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                          >
                            <MessageSquare size={16} />
                            Chat with Helper
                          </button>
                          <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-600">
                            <ShieldCheck size={14} fill="currentColor" className="text-white" />
                            Verified Provider Managed Dispatch
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default LiveTracking;
