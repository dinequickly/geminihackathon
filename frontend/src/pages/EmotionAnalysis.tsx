import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, Upload, Image as ImageIcon, Download, BarChart2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

type Mode = 'webcam' | 'video' | 'image';

const EmotionAnalysis = () => {
  const [mode, setMode] = useState<Mode>('webcam');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const loadModels = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      setError(null);
      const MODEL_URL = '/models';
      console.log('Attempting to load models from:', MODEL_URL);
      
      const loadModel = async (net: any, name: string) => {
        if (net.isLoaded) {
          console.log(`${name} already loaded`);
          return;
        }
        console.log(`Loading ${name}...`);
        await net.loadFromUri(MODEL_URL);
        console.log(`Loaded ${name}`);
      };

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Model loading timed out (15s). Check your connection or see console for details.')), 15000)
      );

      const loadPromise = Promise.all([
        loadModel(faceapi.nets.ssdMobilenetv1, 'ssdMobilenetv1'),
        loadModel(faceapi.nets.faceLandmark68Net, 'faceLandmark68Net'),
        loadModel(faceapi.nets.faceExpressionNet, 'faceExpressionNet')
      ]);

      await Promise.race([loadPromise, timeoutPromise]);
      
      console.log('All models loaded successfully');
      setModelsLoaded(true);
    } catch (err: any) {
      console.error('Error loading models:', err);
      setError(err.message || 'Failed to load AI models. Please check your connection and try again.');
    } finally {
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Emotion Analysis</h1>
          <p className="text-gray-600">Real-time and static analysis of facial expressions using AI.</p>
        </header>

        {error ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-red-200 p-6">
             <div className="text-center">
               <div className="text-red-500 mb-4">
                 <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
               </div>
               <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Models</h3>
               <p className="text-gray-600 mb-4">{error}</p>
               <button 
                 onClick={loadModels}
                 className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
               >
                 Retry Loading
               </button>
             </div>
          </div>
        ) : !modelsLoaded ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading AI Models...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setMode('webcam')}
                  className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-2 ${
                    mode === 'webcam'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Camera size={20} />
                  Live Webcam
                </button>
                <button
                  onClick={() => setMode('video')}
                  className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-2 ${
                    mode === 'video'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Upload size={20} />
                  Video Upload
                </button>
                <button
                  onClick={() => setMode('image')}
                  className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-2 ${
                    mode === 'image'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <ImageIcon size={20} />
                  Image Upload
                </button>
              </nav>
            </div>

            <div className="p-6">
              {mode === 'webcam' && <WebcamMode />}
              {mode === 'video' && <VideoMode />}
              {mode === 'image' && <ImageMode />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const WebcamMode = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error(err);
      }
    };

    const handleVideoPlay = () => {
      if (!videoRef.current || !canvasRef.current) return;

      const displaySize = {
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight
      };

      faceapi.matchDimensions(canvasRef.current, displaySize);

      interval = setInterval(async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const detections = await faceapi.detectAllFaces(videoRef.current)
          .withFaceLandmarks()
          .withFaceExpressions();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
          faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
        }
      }, 100);
    };

    if (isStreaming && videoRef.current) {
      videoRef.current.addEventListener('play', handleVideoPlay);
      startVideo();
    }

    return () => {
      clearInterval(interval);
      if (videoRef.current) {
        videoRef.current.removeEventListener('play', handleVideoPlay);
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
      }
    };
  }, [isStreaming]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative rounded-lg overflow-hidden bg-black aspect-video w-full max-w-3xl mb-4">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 text-white">
            <p>Camera is off</p>
          </div>
        )}
      </div>
      <button
        onClick={() => setIsStreaming(!isStreaming)}
        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
          isStreaming
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {isStreaming ? 'Stop Camera' : 'Start Camera'}
      </button>
    </div>
  );
};

const VideoMode = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      setAnalysisData([]);
      if (videoRef.current) {
        videoRef.current.src = URL.createObjectURL(file);
      }
    }
  };

  const analyzeVideo = async () => {
    if (!videoRef.current) return;
    setIsAnalyzing(true);
    setAnalysisData([]);
    
    const video = videoRef.current;
    video.pause();
    video.currentTime = 0;

    const duration = video.duration;
    const interval = 0.5; // Analyze every 0.5 seconds
    const results = [];

    // Simple sequential processing
    // Note: robust implementation would use requestVideoFrameCallback or similar
    // This is a simplified version for prototype
    
    for (let t = 0; t < duration; t += interval) {
      video.currentTime = t;
      // Wait for seek
      await new Promise(r => video.addEventListener('seeked', r, { once: true }));
      
      const detections = await faceapi.detectAllFaces(video)
        .withFaceExpressions();
      
      if (detections.length > 0) {
        // Just take the first face for simplicity in aggregation
        const expressions = detections[0].expressions;
        const dominant = Object.entries(expressions).reduce((a, b) => a[1] > b[1] ? a : b);
        
        results.push({
          timestamp: t,
          expressions: expressions,
          dominant: dominant[0],
          box: detections[0].detection.box
        });
      }
      
      // Update UI occasionally if needed, but react batching might delay it
      setAnalysisData([...results]);
    }

    setIsAnalyzing(false);
    video.currentTime = 0;
  };

  const jumpToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const downloadCSV = () => {
    if (analysisData.length === 0) return;
    
    const headers = ['timestamp', 'dominant_emotion', 'neutral', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised'];
    const rows = analysisData.map(d => [
      d.timestamp.toFixed(2),
      d.dominant,
      d.expressions.neutral.toFixed(4),
      d.expressions.happy.toFixed(4),
      d.expressions.sad.toFixed(4),
      d.expressions.angry.toFixed(4),
      d.expressions.fearful.toFixed(4),
      d.expressions.disgusted.toFixed(4),
      d.expressions.surprised.toFixed(4)
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "emotion_analysis.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {!videoFile && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:bg-gray-50 transition-colors">
          <input
            type="file"
            accept="video/*"
            className="hidden"
            id="video-upload"
            onChange={handleFileChange}
          />
          <label htmlFor="video-upload" className="cursor-pointer">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Upload a video</h3>
            <p className="text-gray-500 mt-1">MP4, MOV, WebM up to 100MB</p>
          </label>
        </div>
      )}

      {videoFile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
              <video
                ref={videoRef}
                controls
                className="w-full h-full object-contain"
              />
              {/* Overlay canvas could go here for realtime playback overlay if needed */}
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={analyzeVideo}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart2 size={18} />
                    Analyze Video
                  </>
                )}
              </button>
              
              <button 
                onClick={() => setVideoFile(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Change Video
              </button>

              {analysisData.length > 0 && (
                <button
                  onClick={downloadCSV}
                  className="ml-auto flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Download size={18} />
                  Export CSV
                </button>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 h-[500px] overflow-y-auto">
            <h3 className="font-medium text-gray-900 mb-4">Analysis Results</h3>
            {analysisData.length === 0 ? (
              <p className="text-gray-500 text-sm">Click "Analyze Video" to process the uploaded file.</p>
            ) : (
              <div className="space-y-2">
                {analysisData.map((data, i) => (
                  <button
                    key={i}
                    onClick={() => jumpToTime(data.timestamp)}
                    className="w-full text-left p-2 rounded hover:bg-white border border-transparent hover:border-gray-200 text-sm flex items-center justify-between group"
                  >
                    <span className="font-mono text-gray-500">{new Date(data.timestamp * 1000).toISOString().substr(14, 5)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize
                      ${data.dominant === 'happy' ? 'bg-green-100 text-green-700' :
                        data.dominant === 'angry' ? 'bg-red-100 text-red-700' :
                        data.dominant === 'sad' ? 'bg-blue-100 text-blue-700' :
                        data.dominant === 'surprise' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {data.dominant}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ImageMode = () => {
  const [image, setImage] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setImage(url);
      setResults([]);
      
      // Wait for image to load
      setTimeout(() => detectFaces(), 100);
    }
  };

  const detectFaces = async () => {
    if (!imgRef.current || !canvasRef.current) return;
    
    const detections = await faceapi.detectAllFaces(imgRef.current)
      .withFaceLandmarks()
      .withFaceExpressions();
      
    setResults(detections);
    
    // Draw
    const displaySize = { width: imgRef.current.width, height: imgRef.current.height };
    faceapi.matchDimensions(canvasRef.current, displaySize);
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        {!image ? (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:bg-gray-50 transition-colors">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="image-upload"
              onChange={handleImageUpload}
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Upload an image</h3>
              <p className="text-gray-500 mt-1">JPG, PNG up to 10MB</p>
            </label>
          </div>
        ) : (
          <div className="relative rounded-lg overflow-hidden border border-gray-200">
            <img ref={imgRef} src={image} alt="Upload" className="w-full h-auto" onLoad={detectFaces} />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            <button 
              onClick={() => setImage(null)}
              className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
            >
              <Upload size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-6 overflow-auto max-h-[600px]">
        <h3 className="font-medium text-gray-900 mb-4">Detection Results (JSON)</h3>
        {results.length > 0 ? (
          <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap">
            {JSON.stringify(results.map(r => ({
              box: r.detection.box,
              expressions: r.expressions
            })), null, 2)}
          </pre>
        ) : (
          <p className="text-gray-500 text-sm italic">
            {image ? 'Processing...' : 'Upload an image to see results'}
          </p>
        )}
      </div>
    </div>
  );
};

export default EmotionAnalysis;
