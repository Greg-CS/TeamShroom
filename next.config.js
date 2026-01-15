/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.(woff|woff2|eot|ttf|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Default headers for all routes and policies for security
      // Note: CSP is handled by proxy.ts (middleware) using lib/csp-config.ts with nonces for better security
      {
        source: '/(.*)',
        headers: [
        {
        key: 'X-Content-Type-Options',
        // Prevents MIME type sniffing - forces browser to respect Content-Type header
        // Protects against attacks where malicious files are disguised as safe types
        value: 'nosniff',
        },
        {
        key: 'X-Frame-Options',
        // CURRENT: Maximum protection - cannot be framed by any site (prevents all clickjacking)
        value: 'DENY',
        // ALTERNATIVES (uncomment to use):
        // value: 'SAMEORIGIN', // Allow framing only from same origin (useful if you need iframes on your own site)
        },
        {
        key: 'Referrer-Policy',
        // CURRENT: Balanced privacy & functionality - sends origin on cross-origin, full URL on same-origin
        value: 'strict-origin-when-cross-origin',
        // ALTERNATIVES (uncomment to use):
        // value: 'no-referrer', // Most private - no referrer sent (may break analytics/tracking)
        // value: 'no-referrer-when-downgrade', // Default browser behavior - send referrer unless HTTPS→HTTP
        // value: 'origin', // Always send only origin, never full URL (good for privacy)
        // value: 'origin-when-cross-origin', // Full URL same-origin, only origin cross-origin
        // value: 'same-origin', // Only send referrer to same origin (strict, may break external integrations)
        // value: 'strict-origin', // Like 'origin' but no referrer on HTTPS→HTTP downgrade
        // value: 'unsafe-url', // Always send full URL (NOT RECOMMENDED - leaks sensitive data)
        },
        {
        key: 'Permissions-Policy',
        // CURRENT: Restrictive policy - disables most sensitive features
        // Adjust based on your app's needs (e.g., enable camera/microphone for video calls)
        // camera=() - Blocks camera access
        // microphone=() - Blocks microphone access
        // geolocation=() - Blocks location access
        // interest-cohort=() - Blocks Google FLoC tracking
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
        // COMMON ALTERNATIVES (uncomment and modify to use):
        // value: 'camera=(self), microphone=(self), geolocation=(self)', // Allow for same origin
        // value: 'camera=*, microphone=*, geolocation=*', // Allow for all origins (NOT RECOMMENDED)
        // value: 'camera=(self "https://trusted-domain.com"), microphone=()', // Allow specific domains
  
        // AVAILABLE DIRECTIVES (add as needed):
        // - camera=() : Block camera access
        // - microphone=() : Block microphone access
        // - geolocation=() : Block location access
        // - payment=() : Block Payment Request API
        // - usb=() : Block WebUSB API
        // - accelerometer=() : Block accelerometer
        // - gyroscope=() : Block gyroscope
        // - magnetometer=() : Block magnetometer
        // - interest-cohort=() : Block FLoC (Google's tracking)
        // - fullscreen=(self) : Allow fullscreen only from same origin
        // - picture-in-picture=(self) : Allow PiP only from same origin
        }
        ]
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.pokemondb.net',
        pathname: '/sprites/**',
      },
    ],
  },
};

module.exports = nextConfig;
