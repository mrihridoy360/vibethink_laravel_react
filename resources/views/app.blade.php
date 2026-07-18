<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ $meta['site_name'] ?? 'VibeThink LMS' }}</title>
    <meta name="description" content="{{ $meta['site_description'] ?? '' }}">

    @if(!empty($meta['facebook_domain_verification']))
        <meta name="facebook-domain-verification" content="{{ $meta['facebook_domain_verification'] }}">
    @endif
    @if(!empty($meta['google_site_verification']))
        <meta name="google-site-verification" content="{{ $meta['google_site_verification'] }}">
    @endif
    @if(!empty($meta['custom_meta_tags']))
        {!! $meta['custom_meta_tags'] !!}
    @endif

    @if(!empty($meta['site_favicon']))
        <link rel="icon" href="{{ $meta['site_favicon'] }}">
    @endif

    <!-- Open Graph / Social -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="{{ $meta['site_name'] ?? 'VibeThink LMS' }}">
    <meta property="og:description" content="{{ $meta['site_description'] ?? '' }}">
    @if(!empty($meta['site_logo']))
        <meta property="og:image" content="{{ $meta['site_logo'] }}">
    @endif
    <meta property="og:site_name" content="{{ $meta['site_name'] ?? 'VibeThink LMS' }}">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $meta['site_name'] ?? 'VibeThink LMS' }}">
    <meta name="twitter:description" content="{{ $meta['site_description'] ?? '' }}">
    @if(!empty($meta['site_logo']))
        <meta name="twitter:image" content="{{ $meta['site_logo'] }}">
    @endif

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet">

    <!-- Meta Pixel Code Base -->
    <script>
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        if(s && s.parentNode) { s.parentNode.insertBefore(t,s); } else { b.head.appendChild(t); }
        }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    </script>
    <!-- End Meta Pixel Code Base -->

    <!-- Preload site settings to avoid flash of fallback content (FOUC) -->
    <script>
        window.__INITIAL_SITE_SETTINGS__ = @json($initialSettings ?? new \stdClass());
    </script>

    <!-- Styles and Scripts -->
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>

<body class="bg-[#0b0f19] text-gray-100 antialiased selection:bg-purple-600 selection:text-white min-h-screen">
    <div id="app"></div>
</body>

</html>