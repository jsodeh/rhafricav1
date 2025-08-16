import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Heart,
  Bed,
  Bath,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Layers,
  Navigation,
  Crosshair,
  Search,
  Home,
  Filter,
} from "lucide-react";
import { Link } from "react-router-dom";

// Declare global propertyMarkers array
declare global {
  interface Window {
    propertyMarkers: any[];
    mapboxgl: any;
  }
}

interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  image: string;
  images: string[];
  type: string;
  description: string;
  coordinates: { lat: number; lng: number };
  agent: {
    name: string;
    phone: string;
    email: string;
    image: string;
  };
  daysOnMarket: number;
  pricePerSqft: string;
}

interface PropertyMapAdvancedProps {
  properties: Property[];
  selectedProperty?: number | null;
  onPropertySelect?: (propertyId: number) => void;
  className?: string;
  height?: string;
  showControls?: boolean;
  showHeatmap?: boolean;
  enableClustering?: boolean;
  onBoundsChange?: (bounds: any) => void;
  searchQuery?: string;
}

const PropertyMapboxAdvanced: React.FC<PropertyMapAdvancedProps> = ({
  properties,
  selectedProperty,
  onPropertySelect,
  className = "",
  height = "600px",
  showControls = true,
  showHeatmap = false,
  enableClustering = true,
  onBoundsChange,
  searchQuery,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const clustersRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedPopup, setSelectedPopup] = useState<number | null>(null);
  const [mapStyle, setMapStyle] = useState("streets-v12");
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [showHeatmapLayer, setShowHeatmapLayer] = useState(showHeatmap);
  const [showClustering, setShowClustering] = useState(enableClustering);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isAddingData, setIsAddingData] = useState(false); // Prevent multiple simultaneous calls

  // Get Mapbox access token from environment
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  // Map style options
  const mapStyles = [
    { value: "streets-v12", label: "Streets", description: "Detailed street view" },
    { value: "satellite-v9", label: "Satellite", description: "Aerial imagery" },
    { value: "satellite-streets-v12", label: "Hybrid", description: "Satellite with labels" },
    { value: "light-v11", label: "Light", description: "Minimal design" },
    { value: "dark-v11", label: "Dark", description: "Dark theme" },
    { value: "outdoors-v12", label: "Outdoors", description: "Terrain and parks" },
  ];

  // Generate realistic positions for properties if coordinates are not provided
  const getPropertyPosition = (property: Property, index: number) => {
    if (property.coordinates) {
      return property.coordinates;
    }

    // Lagos area coordinates with more variety
    const lagosPositions = [
      { lat: 6.4281, lng: 3.4219 }, // Victoria Island
      { lat: 6.4698, lng: 3.5852 }, // Lekki
      { lat: 6.5875, lng: 3.3619 }, // Ikeja
      { lat: 6.4541, lng: 3.4316 }, // Ikoyi
      { lat: 6.4986, lng: 3.3897 }, // Surulere
      { lat: 6.5244, lng: 3.3792 }, // Lagos Island
      { lat: 6.6018, lng: 3.3515 }, // Agege
      { lat: 6.4626, lng: 3.2447 }, // Magodo
      { lat: 6.5434, lng: 3.3486 }, // Yaba
      { lat: 6.5027, lng: 3.6218 }, // Ajah
    ];

    return lagosPositions[index % lagosPositions.length];
  };

  // Get property price as number for heatmap (supports number or string inputs)
  const getPropertyPriceNumber = (price: any): number => {
    if (price === null || price === undefined) return 0;
    if (typeof price === 'number') return price;
    const raw = String(price);
    const cleaned = raw.replace(/[₦,\s]/g, '').toLowerCase();
    if (cleaned.includes('million')) {
      const base = parseFloat(cleaned.replace('million', ''));
      return isNaN(base) ? 0 : base * 1_000_000;
    }
    if (cleaned.includes('billion')) {
      const base = parseFloat(cleaned.replace('billion', ''));
      return isNaN(base) ? 0 : base * 1_000_000_000;
    }
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  // Get user's current location
  const getUserLocation = useCallback(() => {
    // Only get user location if there are no properties to center on
    if (properties && properties.length > 0) {
      console.log('Skipping user location - properties exist');
      return;
    }
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo({
              center: [longitude, latitude],
              zoom: 14,
              duration: 2000
            });
          }
        },
        (error) => {
          console.warn("Could not get user location:", error);
        }
      );
    }
  }, [properties]);

  // Cleanup markers on unmount
  useEffect(() => {
    return () => {
      if (window.propertyMarkers) {
        window.propertyMarkers.forEach(marker => marker.remove());
        window.propertyMarkers = [];
      }
    };
  }, []);

  // Initialize map (once)
  useEffect(() => {
    console.log('Mapbox token check:', { 
      token: MAPBOX_TOKEN, 
      tokenLength: MAPBOX_TOKEN?.length,
      hasToken: !!MAPBOX_TOKEN,
      tokenStart: MAPBOX_TOKEN?.substring(0, 20),
      tokenEnd: MAPBOX_TOKEN?.substring(MAPBOX_TOKEN?.length - 20)
    });
    
    if (!MAPBOX_TOKEN) {
      console.warn('Mapbox access token not found. Please add VITE_MAPBOX_ACCESS_TOKEN to your environment variables.');
      return;
    }

    if (!mapRef.current || mapInstanceRef.current) return;

    console.log('Starting map initialization...');
    const loadMapbox = async () => {
      try {
        console.log('Loading Mapbox GL library...');
        // Lazy-load mapbox-gl safely
        // @ts-ignore
        if (typeof window !== 'undefined' && !window.mapboxgl) {
          const mod = await import('mapbox-gl');
          // @ts-ignore
          window.mapboxgl = mod.default || mod;
          console.log('Mapbox GL library loaded successfully');
        }

        // @ts-ignore
        const mapboxgl = window.mapboxgl;
        console.log('Setting Mapbox access token...');
        // @ts-ignore
        mapboxgl.accessToken = MAPBOX_TOKEN;
        console.log('Mapbox access token set successfully');

        console.log('Creating new Mapbox map...');
        const mapStyleUrl = `mapbox://styles/mapbox/${mapStyle}`;
        console.log('Using Mapbox style:', mapStyleUrl);
        
        // Calculate center based on properties if available
        let center: [number, number] = [3.3792, 6.5244]; // Default Lagos center
        let zoom = 11;
        
        if (properties && properties.length > 0) {
          const validCoordinates = properties
            .map(p => p.coordinates)
            .filter(coord => coord && coord.lat && coord.lng);
          
          if (validCoordinates.length > 0) {
            const lats = validCoordinates.map(c => c.lat);
            const lngs = validCoordinates.map(c => c.lng);
            const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
            const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
            center = [centerLng, centerLat];
            console.log('Centering map on properties:', center);
          }
        }
        
        const map = new mapboxgl.Map({
          container: mapRef.current!,
          style: mapStyleUrl,
          center: center,
          zoom: zoom,
          pitch: viewMode === "3d" ? 45 : 0,
          bearing: 0,
          antialias: true
        });
        console.log('Mapbox map created successfully');
        console.log('Map container dimensions:', {
          width: mapRef.current?.offsetWidth,
          height: mapRef.current?.offsetHeight,
          clientWidth: mapRef.current?.clientWidth,
          clientHeight: mapRef.current?.clientHeight,
          scrollWidth: mapRef.current?.scrollWidth,
          scrollHeight: mapRef.current?.scrollHeight,
          styleHeight: mapRef.current?.style.height,
          computedHeight: window.getComputedStyle(mapRef.current!).height
        });
        
        // Force a resize to ensure proper dimensions
        setTimeout(() => {
          map.resize();
          console.log('Map resized, new dimensions:', {
            width: map.getCanvas().width,
            height: map.getCanvas().height
          });
        }, 100);

        // Add enhanced controls
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
        map.addControl(new mapboxgl.ScaleControl(), 'bottom-left');
        map.addControl(new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        }), 'top-right');
        console.log('Map controls added successfully');

        map.on('load', () => {
          console.log('✅ Map loaded successfully, adding property data...');
          console.log('🗺️ Map canvas element:', map.getCanvas());
          console.log('📏 Map canvas dimensions:', {
            width: map.getCanvas().width,
            height: map.getCanvas().height,
            styleWidth: map.getCanvas().style.width,
            styleHeight: map.getCanvas().style.height
          });
          setMapLoaded(true);
          
          // Store map instance reference
          mapInstanceRef.current = map;
          
          // Add property data
          addPropertyData(map);
          
          // Fit map bounds to properties after data is added
          if (properties && properties.length > 0) {
            setTimeout(() => {
              try {
                const validCoordinates = properties
                  .map(p => p.coordinates)
                  .filter(coord => coord && coord.lat && coord.lng);
                
                if (validCoordinates.length > 0) {
                  const bounds = new mapboxgl.LngLatBounds();
                  validCoordinates.forEach(coord => {
                    bounds.extend([coord.lng, coord.lat]);
                  });
                  
                  map.fitBounds(bounds, {
                    padding: 50,
                    duration: 1000,
                    maxZoom: 15
                  });
                  console.log('✅ Map bounds fitted to properties');
                }
              } catch (error) {
                console.error('❌ Error fitting bounds:', error);
              }
            }, 500);
          }
          
          // Only center on user location if no properties exist
          if (!properties || properties.length === 0) {
            getUserLocation();
          }
        });

        map.on('error', (e) => {
          console.error('Mapbox map error:', e);
        });

        map.on('styleimagemissing', (e) => {
          console.warn('Mapbox style image missing:', e);
        });

        map.on('styledata', () => {
          console.log('Mapbox style data loaded');
        });

        map.on('sourcedata', (e) => {
          console.log('Mapbox source data event:', e);
        });

        map.on('moveend', () => {
          if (onBoundsChange) {
            onBoundsChange(map.getBounds());
          }
        });

        mapInstanceRef.current = map;
        console.log('Map initialization completed successfully');
        console.log('Map instance stored:', !!mapInstanceRef.current);
        console.log('Map container ref:', !!mapRef.current);
        console.log('Map container element:', mapRef.current);
        
        // Check if map canvas is in the DOM
        setTimeout(() => {
          const canvas = mapRef.current?.querySelector('canvas');
          console.log('Map canvas in DOM:', !!canvas);
          if (canvas) {
            console.log('Canvas element:', canvas);
            console.log('Canvas computed styles:', {
              display: window.getComputedStyle(canvas).display,
              visibility: window.getComputedStyle(canvas).visibility,
              opacity: window.getComputedStyle(canvas).opacity,
              zIndex: window.getComputedStyle(canvas).zIndex,
              position: window.getComputedStyle(canvas).position
            });
          }
        }, 500);

        return () => {
          try {
            map.remove();
          } catch (e) {
            // Ignore remove errors
          }
        };
      } catch (error) {
        console.error('Error loading Mapbox:', error);
      }
    };

    loadMapbox();
    // Do not include dependencies that cause re-creation; we update layers separately
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [MAPBOX_TOKEN]);

  // Add property data to map
  const addPropertyData = useCallback((map: any) => {
    // Prevent multiple simultaneous calls
    if (isAddingData) {
      console.log('🚫 addPropertyData: already in progress, skipping...');
      return;
    }
    
    setIsAddingData(true);
    console.log('🔄 addPropertyData called with:', {
      map: !!map,
      mapLoaded,
      propertiesCount: properties.length,
      firstProperty: properties[0],
      firstPropertyCoordinates: properties[0]?.coordinates,
      allProperties: properties,
      timestamp: new Date().toISOString()
    });
    
    if (!map || !mapLoaded) {
      console.log('❌ addPropertyData: map not ready or not loaded');
      setIsAddingData(false);
      return;
    }

    // Validate properties data
    if (!properties || properties.length === 0) {
      console.log('❌ addPropertyData: no properties to display');
      setIsAddingData(false);
      return;
    }

    // Check if properties have valid coordinates
    const validProperties = properties.filter(p => p.coordinates && p.coordinates.lat && p.coordinates.lng);
    console.log('✅ addPropertyData: valid properties with coordinates:', {
      total: properties.length,
      valid: validProperties.length,
      invalid: properties.length - validProperties.length,
      sampleValid: validProperties[0],
      sampleInvalid: properties.find(p => !p.coordinates || !p.coordinates.lat || !p.coordinates.lng)
    });

    if (validProperties.length === 0) {
      console.log('❌ addPropertyData: no properties with valid coordinates');
      setIsAddingData(false);
      return;
    }

    // Check if source already exists and has data
    const existingSource = map.getSource('properties');
    if (existingSource) {
      console.log('🔍 Existing source found, checking data...');
      try {
        const currentData = existingSource.serialize();
        console.log('📊 Current source data:', {
          hasData: !!currentData,
          dataType: currentData?.type,
          featureCount: currentData?.data?.features?.length || 0
        });
      } catch (error) {
        console.log('⚠️ Could not serialize existing source:', error);
      }
    }

    // Prepare GeoJSON data
    const geojsonData = {
      type: 'FeatureCollection',
      features: validProperties.map((property, index) => {
        const position = getPropertyPosition(property, index);
        console.log(`Creating feature for property ${index}:`, {
          propertyId: property.id,
          position,
          coordinates: property.coordinates
        });
        return {
          type: 'Feature',
          properties: {
            id: property.id,
            title: property.title,
            price: property.price,
            priceNumber: getPropertyPriceNumber(property.price),
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            area: property.area,
            image: property.image,
            type: property.type,
            description: property.description,
            isSelected: selectedProperty === property.id
          },
          geometry: {
            type: 'Point',
            coordinates: [position.lng, position.lat]
          }
        };
      })
    };

    console.log('📊 Adding GeoJSON source to map:', {
      sourceId: 'properties',
      data: geojsonData,
      featureCount: geojsonData.features.length,
      sourceExists: !!map.getSource('properties'),
      timestamp: new Date().toISOString()
    });

    try {
      // Add or update the GeoJSON source (needed for map rendering and property counting)
      if (map.getSource('properties')) {
        console.log('🔄 Updating existing properties source...');
        map.getSource('properties').setData(geojsonData);
        console.log('✅ Updated existing properties source');
      } else {
        console.log('🆕 Adding new properties source...');
        map.addSource('properties', {
          type: 'geojson',
          data: geojsonData,
          cluster: showClustering,
          clusterMaxZoom: 14,
          clusterRadius: 50
        });
        console.log('✅ Added new properties source');
      }
      
      console.log('✅ Source added/updated successfully, source count:', map.getSource('properties') ? 'exists' : 'missing');
      
      // Verify source data after creation/update
      setTimeout(() => {
        const source = map.getSource('properties');
        if (source) {
          try {
            const data = source.serialize();
            console.log('🔍 Source verification after 100ms:', {
              hasSource: !!source,
              hasData: !!data,
              featureCount: data?.data?.features?.length || 0,
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            console.log('⚠️ Could not verify source data:', error);
          }
        } else {
          console.log('❌ Source missing after creation!');
        }
      }, 100);
      
      // Add layers
      console.log('Adding map layers...');
      
      // Remove existing markers if any
      if (window.propertyMarkers) {
        window.propertyMarkers.forEach(marker => marker.remove());
      }
      window.propertyMarkers = [];
      
      // Add custom HTML markers for each property
      validProperties.forEach((property) => {
        if (property.coordinates && property.coordinates.lat && property.coordinates.lng) {
          // Create marker element
          const markerEl = document.createElement('div');
          markerEl.className = 'custom-property-marker';
          
          // Create image element
          const img = document.createElement('img');
          img.src = property.image && property.image !== '/placeholder.svg' ? property.image : '/placeholder.svg';
          img.onerror = () => {
            img.src = '/placeholder.svg';
          };
          
          markerEl.appendChild(img);
          
          // Create popup content
          const popupContent = `
            <div class="p-3">
              <h3 class="font-semibold text-sm mb-2">${property.title}</h3>
              <div class="text-lg font-bold text-blue-700 mb-2">₦${property.price?.toLocaleString()}</div>
              <div class="flex items-center gap-2 text-xs text-gray-600">
                ${property.bedrooms ? `<span>${property.bedrooms} beds</span>` : ''}
                ${property.bathrooms ? `<span>${property.bathrooms} baths</span>` : ''}
              </div>
            </div>
          `;
          
          // Create popup
          // @ts-ignore
          const mapboxgl = window.mapboxgl;
          const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            className: 'property-popup'
          }).setHTML(popupContent);
          
          // Create marker
          const marker = new mapboxgl.Marker(markerEl)
            .setLngLat([property.coordinates.lng, property.coordinates.lat])
            .setPopup(popup)
            .addTo(map);
          
          // Add click handler
          markerEl.addEventListener('click', () => {
            onPropertySelect?.(property.id);
          });
          
          // Add hover effects
          markerEl.addEventListener('mouseenter', () => {
            popup.addTo(map);
          });
          
          markerEl.addEventListener('mouseleave', () => {
            popup.remove();
          });
          
          // Store marker reference
          window.propertyMarkers.push(marker);
        }
      });
      
      console.log(`Added ${window.propertyMarkers.length} custom property markers`);
      
      // Add cluster layer for clustering functionality
      if (showClustering && !map.getLayer('clusters')) {
        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'properties',
          filter: ['has', 'point_count'],
          paint: {
            'circle-radius': 20,
            'circle-color': '#10B981',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#FFFFFF'
          }
        });
        console.log('Added clusters layer');
      }

      // Add cluster count layer
      if (showClustering && !map.getLayer('cluster-count')) {
        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'properties',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          },
          paint: {
            'text-color': '#FFFFFF'
          }
        });
        console.log('Added cluster-count layer');
      }

      // Add heatmap layer
      if (showHeatmapLayer) {
        if (!map.getLayer('property-heatmap')) {
          map.addLayer({
            id: 'property-heatmap',
            type: 'heatmap',
            source: 'properties',
            maxzoom: 15,
            paint: {
              'heatmap-weight': [
                'interpolate',
                ['linear'],
                ['get', 'priceNumber'],
                0,
                0,
                100000000,
                1
              ],
              'heatmap-intensity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0,
                1,
                15,
                3
              ],
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0,
                'rgba(33,102,172,0)',
                0.2,
                'rgb(103,169,207)',
                0.4,
                'rgb(209,229,240)',
                0.6,
                'rgb(253,219,199)',
                0.8,
                'rgb(239,138,98)',
                1,
                'rgb(178,24,43)'
              ],
              'heatmap-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0,
                2,
                15,
                20
              ],
              'heatmap-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                7,
                1,
                15,
                0
              ]
            }
          }, 'waterway-label');
        }
      } else {
        if (map.getLayer('property-heatmap')) map.removeLayer('property-heatmap');
      }
      
      // Add unclustered points layer (needed for property counting and map interaction)
      if (!map.getLayer('unclustered-point')) {
        map.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'properties',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': 'transparent', // Make invisible since we have HTML markers
            'circle-radius': 0, // Make invisible since we have HTML markers
            'circle-stroke-width': 0
          }
        });
        console.log('✅ Added invisible unclustered-point layer for property counting');
      }
      
      // Add property labels layer (shows prices on map)
      if (!map.getLayer('property-labels')) {
        map.addLayer({
          id: 'property-labels',
          type: 'symbol',
          source: 'properties',
          filter: ['!', ['has', 'point_count']],
          layout: {
            'text-field': [
              'format',
              ['get', 'price'],
              { 'font-scale': 0.8 }
            ],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 10,
            'text-offset': [0, 2],
            'text-anchor': 'top'
          },
          paint: {
            'text-color': '#1a1a1a',
            'text-halo-color': '#ffffff',
            'text-halo-width': 1
          }
        });
        console.log('✅ Added property-labels layer for price display');
      }
      
      // Final verification - check if source still has data
      setTimeout(() => {
        const finalSource = map.getSource('properties');
        if (finalSource) {
          try {
            const finalData = finalSource.serialize();
            console.log('🎯 Final source verification:', {
              hasSource: !!finalSource,
              hasData: !!finalData,
              featureCount: finalData?.data?.features?.length || 0,
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            console.log('⚠️ Could not verify final source data:', error);
          }
        } else {
          console.log('❌ Source missing in final verification!');
        }
      }, 500);
    } catch (error) {
      console.error('❌ Error adding property data layers:', error);
    } finally {
      // Always reset the flag
      setIsAddingData(false);
      console.log('✅ addPropertyData completed, flag reset');
    }
  }, [properties, selectedProperty, showClustering, showHeatmapLayer, mapLoaded, isAddingData]);

  // Setup map interactions
  const setupMapInteractions = useCallback((map: any) => {
    // Click on clusters
    map.on('click', 'clusters', (e: any) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      const clusterId = features[0].properties.cluster_id;
      map.getSource('properties').getClusterExpansionZoom(
        clusterId,
        (err: any, zoom: number) => {
          if (err) return;
          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom
          });
        }
      );
    });

    // Click on unclustered points
    map.on('click', 'unclustered-point', (e: any) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const properties = e.features[0].properties;
      
      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      map.flyTo({
        center: coordinates,
        zoom: 15
      });
      
      setSelectedPopup(properties.id);
      onPropertySelect?.(properties.id);
    });

    // Add hover functionality for property markers
    let hoveredPropertyId: string | null = null;
    
    // Change cursor on hover
    map.on('mouseenter', 'property-markers', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    
    map.on('mouseleave', 'property-markers', () => {
      map.getCanvas().style.cursor = '';
    });
    
    // Show popup on hover
    map.on('mouseenter', 'property-markers', (e) => {
      if (e.features && e.features[0]) {
        const feature = e.features[0];
        const coordinates = feature.geometry.coordinates.slice();
        const price = feature.properties.price;
        const title = feature.properties.title;
        const bedrooms = feature.properties.bedrooms;
        const bathrooms = feature.properties.bathrooms;
        
        // Create popup content
        const popupContent = `
          <div class="p-3">
            <h3 class="font-semibold text-sm mb-2">${title}</h3>
            <div class="text-lg font-bold text-blue-700 mb-2">₦${price}</div>
            <div class="flex items-center gap-2 text-xs text-gray-600">
              ${bedrooms ? `<span>${bedrooms} beds</span>` : ''}
              ${bathrooms ? `<span>${bathrooms} baths</span>` : ''}
            </div>
          </div>
        `;
        
        // Create and show popup using the mapboxgl instance from window
        // @ts-ignore
        const mapboxgl = window.mapboxgl;
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          className: 'property-popup'
        })
        .setLngLat(coordinates)
        .setHTML(popupContent)
        .addTo(map);
        
        // Store popup reference for cleanup
        feature.properties.popup = popup;
      }
    });
    
    // Hide popup on mouse leave
    map.on('mouseleave', 'property-markers', (e) => {
      if (e.features && e.features[0] && e.features[0].properties.popup) {
        e.features[0].properties.popup.remove();
      }
    });
  }, [onPropertySelect]);

  // Update map style
  const changeMapStyle = (newStyle: string) => {
    if (mapInstanceRef.current) {
      setMapStyle(newStyle);
      mapInstanceRef.current.setStyle(`mapbox://styles/mapbox/${newStyle}`);
      
      mapInstanceRef.current.once('style.load', () => {
        addPropertyData(mapInstanceRef.current);
        setupMapInteractions(mapInstanceRef.current);
      });
    }
  };

  // Toggle 3D view
  const toggle3D = () => {
    if (mapInstanceRef.current) {
      const newViewMode = viewMode === "2d" ? "3d" : "2d";
      setViewMode(newViewMode);
      
      mapInstanceRef.current.easeTo({
        pitch: newViewMode === "3d" ? 45 : 0,
        bearing: newViewMode === "3d" ? -17.6 : 0,
        duration: 1000
      });
    }
  };

  // Reset map view
  const resetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [3.3792, 6.5244],
        zoom: 11,
        pitch: 0,
        bearing: 0,
        duration: 2000
      });
    }
  };

  // Fit to properties bounds
  const fitToBounds = () => {
    if (mapInstanceRef.current && properties.length > 0) {
      const coordinates = properties.map((property, index) => {
        const position = getPropertyPosition(property, index);
        return [position.lng, position.lat];
      });
      
      const bounds = coordinates.reduce(
        (bounds, coord) => bounds.extend(coord),
        new (window as any).mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
      );
      
      mapInstanceRef.current.fitBounds(bounds, {
        padding: 50,
        duration: 1000
      });
    }
  };

  // Add property data when properties change
  useEffect(() => {
    console.log('🔄 useEffect triggered for addPropertyData:', {
      propertiesCount: properties.length,
      mapLoaded,
      selectedProperty,
      showClustering,
      showHeatmapLayer,
      timestamp: new Date().toISOString(),
      propertiesArray: properties.map(p => ({ id: p.id, title: p.title, hasCoordinates: !!p.coordinates }))
    });
    
    if (mapInstanceRef.current && mapLoaded) {
      console.log('🚀 Calling addPropertyData...');
      addPropertyData(mapInstanceRef.current);
    } else {
      console.log('⏳ Skipping addPropertyData - map not ready:', {
        hasMapInstance: !!mapInstanceRef.current,
        mapLoaded
      });
    }
  }, [properties, selectedProperty, showClustering, showHeatmapLayer, mapLoaded, addPropertyData]);

  // Setup map interactions when map is ready
  useEffect(() => {
    if (mapInstanceRef.current && mapLoaded) {
      console.log('🔧 Setting up map interactions...');
      setupMapInteractions(mapInstanceRef.current);
    }
  }, [mapLoaded, setupMapInteractions]);

  if (!MAPBOX_TOKEN) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center p-8">
          <div className="text-gray-600 mb-4">
            <MapPin className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Map Not Available</h3>
            <p className="text-sm">Please add your Mapbox access token to enable maps.</p>
          </div>
          <div className="bg-gray-50 rounded p-4 text-left text-xs">
            <p>1. Get your free access token from <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">mapbox.com</a></p>
            <p>2. Add it to your .env.local file:</p>
            <code className="block mt-1 bg-white p-2 rounded">VITE_MAPBOX_ACCESS_TOKEN=your_token_here</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <style>
        {`
          .custom-property-marker {
            transition: all 0.2s ease;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            overflow: hidden;
            cursor: pointer;
          }
          .custom-property-marker:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 16px rgba(0,0,0,0.4);
            border-color: #3b82f6;
          }
          .custom-property-marker img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .property-popup .mapboxgl-popup-content {
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border: none;
            padding: 0;
            min-width: 200px;
          }
          .property-popup .mapboxgl-popup-content h3 {
            margin: 0;
            color: #1f2937;
            font-weight: 600;
          }
          .property-popup .mapboxgl-popup-content .text-blue-700 {
            color: #1d4ed8;
            font-weight: 700;
          }
          .property-popup .mapboxgl-popup-content .text-gray-600 {
            color: #4b5563;
          }
          .property-popup .mapboxgl-popup-tip {
            border-top-color: white;
          }
          .mapboxgl-popup-close-button {
            display: none;
          }
          /* Ensure map container has proper dimensions */
          .mapboxgl-canvas-container {
            width: 100% !important;
            height: 100% !important;
          }
          .mapboxgl-canvas {
            width: 100% !important;
            height: 100% !important;
          }
        `}
      </style>
      <div ref={mapRef} className="w-full h-full rounded-lg bg-red-200 border-2 border-red-500" />

      {/* Map Controls */}
      {showControls && (
        <div className="absolute top-4 left-4 z-10 space-y-2">
          {/* Property Count */}
          <Badge className="bg-white text-gray-900 border shadow-lg">
            {properties.length} properties
          </Badge>

          {/* Map Style Selector */}
          <Card className="p-2 shadow-lg">
            <Select value={mapStyle} onValueChange={changeMapStyle}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <Layers className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mapStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    <div className="text-left">
                      <div className="font-medium">{style.label}</div>
                      <div className="text-xs text-gray-500">{style.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          {/* View Options */}
          <Card className="p-3 shadow-lg space-y-2">
            <div className="flex items-center space-x-2">
              <Switch 
                id="clustering" 
                checked={showClustering}
                onCheckedChange={(checked) => setShowClustering(checked)}
              />
              <Label htmlFor="clustering" className="text-xs">Clustering</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="heatmap" 
                checked={showHeatmapLayer}
                onCheckedChange={(checked) => setShowHeatmapLayer(checked)}
              />
              <Label htmlFor="heatmap" className="text-xs">Heat Map</Label>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-1">
            <Button
              variant="outline"
              size="sm"
              onClick={toggle3D}
              className="w-10 h-10 p-0 bg-white shadow-lg"
              title={viewMode === "2d" ? "Switch to 3D" : "Switch to 2D"}
            >
              <span className="text-xs font-bold">{viewMode === "2d" ? "3D" : "2D"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={getUserLocation}
              className="w-10 h-10 p-0 bg-white shadow-lg"
              title="My Location"
            >
              <Crosshair className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fitToBounds}
              className="w-10 h-10 p-0 bg-white shadow-lg"
              title="Fit All Properties"
            >
              <Home className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetView}
              className="w-10 h-10 p-0 bg-white shadow-lg"
              title="Reset View"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Search Integration Indicator */}
      {searchQuery && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-blue-600 text-white shadow-lg">
            <Search className="h-3 w-3 mr-1" />
            Filtered: {searchQuery}
          </Badge>
        </div>
      )}

      {/* Property Popup */}
      {selectedPopup && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          {(() => {
            const property = properties.find(p => p.id === selectedPopup);
            if (!property) return null;

            return (
              <Card className="w-80 shadow-xl border-0">
                <CardContent className="p-0">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPopup(null)}
                      className="absolute top-2 right-2 h-6 w-6 p-0 bg-white/90 hover:bg-white z-10"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-40 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 left-2 bg-red-600 text-white border-0 text-xs">
                      {property.type}
                    </Badge>
                    <div className="absolute top-2 right-8">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 bg-white/90 hover:bg-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Heart className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="font-bold text-xl mb-2">
                      {property.price}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                      {property.title}
                    </h3>
                    <div className="flex items-center space-x-3 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Bed className="h-3 w-3 mr-1" />
                        <span>{property.bedrooms}</span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-3 w-3 mr-1" />
                        <span>{property.bathrooms}</span>
                      </div>
                      <span>{property.area}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="line-clamp-1">
                        {property.location}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Link to={`/properties/${property.id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline" className="px-3">
                        <Heart className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </div>
      )}

      {/* User Location Indicator */}
      {userLocation && (
        <div className="absolute bottom-4 right-4 z-10">
          <Badge className="bg-green-600 text-white shadow-lg">
            <Navigation className="h-3 w-3 mr-1" />
            Current Location
          </Badge>
        </div>
      )}
    </div>
  );
};

export default PropertyMapboxAdvanced;
