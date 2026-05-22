<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Order Processing - NextGen</title>

    <!-- Google Fonts: Outfit -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">

    <!-- Tailwind CSS v4 Browser -->
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>

    <style type="text/tailwindcss">
        @theme {
            --font-sans: 'Outfit', sans-serif;
            --color-glass: rgba(255, 255, 255, 0.05);
            --color-glass-border: rgba(255, 255, 255, 0.1);
        }

        body {
            font-family: 'Outfit', sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
            overflow-x: hidden;
        }

        /* Ambient animated background blobs */
        .blob-1 {
            position: absolute;
            top: -10%;
            left: -10%;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(0,0,0,0) 70%);
            border-radius: 50%;
            animation: float 10s ease-in-out infinite;
            z-index: -1;
        }

        .blob-2 {
            position: absolute;
            bottom: -20%;
            right: -10%;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(56,189,248,0.2) 0%, rgba(0,0,0,0) 70%);
            border-radius: 50%;
            animation: float 12s ease-in-out infinite reverse;
            z-index: -1;
        }

        @keyframes float {
            0% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-30px) scale(1.05); }
            100% { transform: translateY(0) scale(1); }
        }

        .glass-panel {
            background: var(--color-glass);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid var(--color-glass-border);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .btn-primary {
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px -5px rgba(168, 85, 247, 0.4);
            filter: brightness(1.1);
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-2px);
        }
    </style>
</head>
<body class="antialiased min-h-screen relative flex items-center justify-center p-6">

    <!-- Ambient Background -->
    <div class="blob-1"></div>
    <div class="blob-2"></div>

    <div class="max-w-5xl w-full z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <!-- Content Side -->
        <div class="flex flex-col space-y-8 animation-fade-in-up">
            <div class="space-y-4">
                <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full glass-panel text-sm text-sky-300">
                    <span class="relative flex h-2 w-2">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                    </span>
                    <span>Order Service is Online</span>
                </div>
                
                <h1 class="text-5xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                    NextGen Order <br/> Processing.
                </h1>
                
                <p class="text-lg text-slate-300 leading-relaxed max-w-lg">
                    Experience seamless, high-performance order management. Track shipments, process refunds, and manage inventory at the speed of light.
                </p>
            </div>

            <div class="flex flex-wrap gap-4">
                <a href="#" class="btn-primary px-8 py-4 rounded-xl font-semibold text-white flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                    View All Orders
                </a>
                <a href="#" class="btn-secondary px-8 py-4 rounded-xl font-semibold text-white flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                    Track Package
                </a>
            </div>

            <div class="flex items-center gap-6 pt-4 border-t border-slate-800">
                <div>
                    <h4 class="text-3xl font-bold text-white">99.9%</h4>
                    <span class="text-sm text-slate-400 uppercase tracking-wider">Uptime</span>
                </div>
                <div class="w-px h-10 bg-slate-800"></div>
                <div>
                    <h4 class="text-3xl font-bold text-white">2.5M+</h4>
                    <span class="text-sm text-slate-400 uppercase tracking-wider">Orders Processed</span>
                </div>
            </div>
        </div>

        <!-- Visual / Interactive Side -->
        <div class="glass-panel rounded-3xl p-8 relative hidden lg:block overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
            <!-- Simulated App Interface -->
            <div class="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <h3 class="text-xl font-semibold text-white">Recent Orders</h3>
                <span class="px-3 py-1 bg-white/10 rounded-lg text-sm">Live Updates</span>
            </div>

            <div class="space-y-4">
                <!-- Order Item -->
                <div class="bg-white/5 p-4 rounded-2xl flex justify-between items-center hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <div>
                            <p class="font-medium text-white">Order #ORD-8832</p>
                            <p class="text-sm text-slate-400">Delivered • 2 mins ago</p>
                        </div>
                    </div>
                    <span class="font-semibold text-white">$124.00</span>
                </div>

                <!-- Order Item -->
                <div class="bg-white/5 p-4 rounded-2xl flex justify-between items-center hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div>
                            <p class="font-medium text-white">Order #ORD-8833</p>
                            <p class="text-sm text-slate-400">In Transit • 15 mins ago</p>
                        </div>
                    </div>
                    <span class="font-semibold text-white">$89.50</span>
                </div>

                <!-- Order Item -->
                <div class="bg-white/5 p-4 rounded-2xl flex justify-between items-center hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                        </div>
                        <div>
                            <p class="font-medium text-white">Order #ORD-8834</p>
                            <p class="text-sm text-slate-400">Processing • 1 hr ago</p>
                        </div>
                    </div>
                    <span class="font-semibold text-white">$210.00</span>
                </div>
            </div>

            <!-- Decorative gradient overlay -->
            <div class="absolute -bottom-20 -right-20 w-64 h-64 bg-fuchsia-500/20 blur-3xl rounded-full pointer-events-none"></div>
        </div>
    </div>

</body>
</html>
