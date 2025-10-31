import React from 'react';
import { Sparkles, Zap, Eye, Heart, Star } from 'lucide-react';

export default function ThemeEffectsShowcase() {
  return (
    <div className="space-y-12 p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Dramatic Theme Effects Showcase</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Experience the power of modern CSS animations and effects. Each theme creates a unique visual transformation
          with ghost buttons, dramatic hover effects, and smooth animations.
        </p>
      </div>

      {/* Ghost Button Variations */}
      <section className="bg-white rounded-xl border-2 border-gray-200 p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Sparkles size={28} />
          Ghost Button Effects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <button className="ghost-btn">Classic Fill</button>
            <p className="text-sm text-gray-600 mt-3">Fills from left on hover</p>
          </div>
          <div className="text-center">
            <button className="ghost-btn-neon">Neon Glow</button>
            <p className="text-sm text-gray-600 mt-3">Electric glow effect</p>
          </div>
          <div className="text-center">
            <button className="ghost-btn-ripple">Ripple Fill</button>
            <p className="text-sm text-gray-600 mt-3">Circular ripple from center</p>
          </div>
          <div className="text-center">
            <button className="ghost-btn-slide">Slide Up</button>
            <p className="text-sm text-gray-600 mt-3">Slides from bottom</p>
          </div>
          <div className="text-center">
            <button className="ghost-btn-corners">Corners Fill</button>
            <p className="text-sm text-gray-600 mt-3">Fills from corners</p>
          </div>
          <div className="text-center">
            <button className="theme-button-glow px-8 py-3">Glow Pulse</button>
            <p className="text-sm text-gray-600 mt-3">Pulsing glow effect</p>
          </div>
        </div>
      </section>

      {/* Card Effects */}
      <section className="bg-white rounded-xl border-2 border-gray-200 p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Zap size={28} />
          Dramatic Card Effects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-tilt bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold mb-2">3D Tilt Card</h3>
            <p className="text-sm text-gray-600">Rotates in 3D space on hover</p>
          </div>
          <div className="card-glow-intense bg-gradient-to-br from-pink-50 to-orange-50 p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold mb-2">Intense Glow</h3>
            <p className="text-sm text-gray-600">Multi-layer glow effect</p>
          </div>
          <div className="card-slide-shine bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold mb-2">Slide Shine</h3>
            <p className="text-sm text-gray-600">Light shimmer across card</p>
          </div>
          <div className="card-flip bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold mb-2">Flip Effect</h3>
            <p className="text-sm text-gray-600">3D flip perspective</p>
          </div>
          <div className="card-scale-glow bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold mb-2">Scale with Glow</h3>
            <p className="text-sm text-gray-600">Grows and glows on hover</p>
          </div>
          <div className="theme-card-glass p-6 rounded-lg">
            <h3 className="font-bold mb-2">Glass Morphism</h3>
            <p className="text-sm text-gray-600">Frosted glass effect</p>
          </div>
        </div>
      </section>

      {/* Animation Showcase */}
      <section className="bg-white rounded-xl border-2 border-gray-200 p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Star size={28} />
          Modern Animations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="anim-slide-in-left bg-gray-50 p-6 rounded-lg text-center">
            <Eye className="mx-auto mb-2" size={32} />
            <p className="text-sm font-semibold">Slide In Left</p>
          </div>
          <div className="anim-slide-in-right bg-gray-50 p-6 rounded-lg text-center">
            <Heart className="mx-auto mb-2" size={32} />
            <p className="text-sm font-semibold">Slide In Right</p>
          </div>
          <div className="anim-fade-scale-in bg-gray-50 p-6 rounded-lg text-center">
            <Sparkles className="mx-auto mb-2" size={32} />
            <p className="text-sm font-semibold">Fade Scale In</p>
          </div>
          <div className="anim-float bg-gray-50 p-6 rounded-lg text-center">
            <Zap className="mx-auto mb-2" size={32} />
            <p className="text-sm font-semibold">Floating</p>
          </div>
        </div>
      </section>

      {/* Gaming Theme Effects (only visible with gaming theme) */}
      <section className="bg-white rounded-xl border-2 border-gray-200 p-8">
        <h2 className="text-2xl font-bold mb-6">Gaming Theme Effects</h2>
        <p className="text-sm text-gray-600 mb-4">Apply a gaming theme to see these effects</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="gaming-neon-pulse bg-gray-900 text-white p-6 rounded-lg text-center">
            <p className="font-bold">Neon Pulse</p>
            <p className="text-xs mt-2 opacity-70">Pulsing neon effect</p>
          </div>
          <div className="gaming-scanline bg-gray-900 text-white p-6 rounded-lg text-center relative">
            <p className="font-bold">Scan Line</p>
            <p className="text-xs mt-2 opacity-70">Moving scan line</p>
          </div>
          <div className="gaming-glitch bg-gray-900 text-white p-6 rounded-lg text-center">
            <p className="font-bold">Glitch Effect</p>
            <p className="text-xs mt-2 opacity-70">Digital glitch animation</p>
          </div>
        </div>
      </section>

      {/* Holiday Theme Effects (only visible with holiday theme) */}
      <section className="bg-white rounded-xl border-2 border-gray-200 p-8">
        <h2 className="text-2xl font-bold mb-6">Holiday Theme Effects</h2>
        <p className="text-sm text-gray-600 mb-4">Apply a holiday theme to see these effects</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="holiday-sparkle bg-gradient-to-br from-red-50 to-green-50 p-8 rounded-lg text-center relative">
            <p className="font-bold">Sparkle Rotate</p>
            <p className="text-xs mt-2 text-gray-600">Festive sparkle animation</p>
          </div>
          <div className="holiday-glow-pulse bg-gradient-to-br from-orange-50 to-yellow-50 p-8 rounded-lg text-center">
            <p className="font-bold">Warm Glow Pulse</p>
            <p className="text-xs mt-2 text-gray-600">Cozy pulsing glow</p>
          </div>
        </div>
      </section>

      {/* Style Theme Effects (only visible with style theme) */}
      <section className="bg-white rounded-xl border-2 border-gray-200 p-8">
        <h2 className="text-2xl font-bold mb-6">Modern Style Effects</h2>
        <p className="text-sm text-gray-600 mb-4">Apply a style theme to see these effects</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="style-morph bg-gradient-to-br from-purple-100 to-pink-100 p-8 rounded-lg text-center w-32 h-32 mx-auto flex items-center justify-center">
            <p className="font-bold text-sm">Smooth Morph</p>
          </div>
          <div className="style-glass-ripple bg-gradient-to-br from-blue-100 to-cyan-100 p-8 rounded-lg text-center relative overflow-hidden">
            <p className="font-bold">Glass Ripple</p>
            <p className="text-xs mt-2 text-gray-600">Glass effect expands</p>
          </div>
        </div>
      </section>

      {/* Navigation Effects */}
      <section className="bg-white rounded-xl border-2 border-gray-200 p-8">
        <h2 className="text-2xl font-bold mb-6">Navigation Effects</h2>
        <div className="flex gap-8 justify-center">
          <a href="#" className="nav-item-slide px-4 py-2 font-semibold">Slide Underline</a>
          <a href="#" className="nav-item-glow-trail px-4 py-2 font-semibold">Glow Trail</a>
        </div>
      </section>

      {/* Input Effects */}
      <section className="bg-white rounded-xl border-2 border-gray-200 p-8">
        <h2 className="text-2xl font-bold mb-6">Input Effects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="input-modern">
            <input type="text" placeholder=" " id="modern-input" />
            <label htmlFor="modern-input">Modern Floating Label</label>
          </div>
          <div>
            <input type="text" placeholder="Glow on focus" className="input-glow w-full px-4 py-3 rounded-lg" />
          </div>
        </div>
      </section>

      {/* Color Shift Background */}
      <section className="anim-color-shift rounded-xl p-12 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Animated Gradient Background</h2>
        <p className="text-lg opacity-90">Smooth color shifting animation</p>
      </section>

      {/* Usage Instructions */}
      <section className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-4">How to Use These Effects</h2>
        <div className="space-y-3 text-sm">
          <p><strong>Apply to buttons:</strong> Add classes like <code className="bg-white px-2 py-1 rounded">ghost-btn</code>, <code className="bg-white px-2 py-1 rounded">ghost-btn-neon</code>, etc.</p>
          <p><strong>Apply to cards:</strong> Add classes like <code className="bg-white px-2 py-1 rounded">card-tilt</code>, <code className="bg-white px-2 py-1 rounded">card-glow-intense</code>, etc.</p>
          <p><strong>Apply animations:</strong> Add classes like <code className="bg-white px-2 py-1 rounded">anim-slide-in-left</code>, <code className="bg-white px-2 py-1 rounded">anim-float</code>, etc.</p>
          <p><strong>Theme-specific effects:</strong> Gaming, holiday, and style effects activate automatically when those theme categories are applied</p>
        </div>
      </section>
    </div>
  );
}
