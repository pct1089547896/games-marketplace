import { FileText, Gamepad2, Package, Newspaper, Trophy, Sparkles, Lightbulb, Megaphone } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: string;
  icon: any;
  description: string;
  content: string;
  colorScheme?: string;
}

interface ContentTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateSelect: (content: string) => void;
  contentType: 'games' | 'programs' | 'blog';
}

const TEMPLATES: Record<string, Template[]> = {
  games: [
    {
      id: 'game-review',
      name: 'Game Review',
      category: 'review',
      icon: Trophy,
      description: 'Comprehensive game review with ratings',
      colorScheme: 'blue',
      content: `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; border-radius: 12px; color: white; margin-bottom: 24px;">
  <h1 style="margin: 0; font-size: 2.5em; font-weight: bold;">Game Title Review</h1>
  <p style="margin: 8px 0 0 0; font-size: 1.2em; opacity: 0.9;">An in-depth look at this exciting title</p>
</div>

<h2 style="color: #667eea; border-bottom: 3px solid #667eea; padding-bottom: 8px;">Overview</h2>
<p>Provide a compelling introduction to the game, highlighting its genre, developer, and what makes it stand out...</p>

<h2 style="color: #667eea; border-bottom: 3px solid #667eea; padding-bottom: 8px;">Gameplay Mechanics</h2>
<p><strong>Core Loop:</strong> Describe the main gameplay loop and what players will be doing...</p>
<ul style="line-height: 1.8;">
  <li><strong>Controls:</strong> How intuitive and responsive are they?</li>
  <li><strong>Progression:</strong> How does the player advance?</li>
  <li><strong>Challenge:</strong> What's the difficulty curve like?</li>
</ul>

<div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 24px 0; border-radius: 4px;">
  <h3 style="margin-top: 0; color: #667eea;">Rating Breakdown</h3>
  <p><strong>Graphics:</strong> 9/10 - Stunning visuals with attention to detail</p>
  <p><strong>Gameplay:</strong> 8/10 - Engaging mechanics with minor issues</p>
  <p><strong>Story:</strong> 9/10 - Compelling narrative that keeps you hooked</p>
  <p><strong>Sound:</strong> 8/10 - Excellent soundtrack and sound effects</p>
  <p style="margin-bottom: 0;"><strong>Overall:</strong> 8.5/10 - Highly recommended</p>
</div>

<h2 style="color: #667eea; border-bottom: 3px solid #667eea; padding-bottom: 8px;">Pros & Cons</h2>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
  <div style="background: #d4edda; padding: 16px; border-radius: 8px;">
    <h3 style="color: #155724; margin-top: 0;">Pros</h3>
    <ul style="margin-bottom: 0;">
      <li>Beautiful graphics and art style</li>
      <li>Engaging storyline</li>
      <li>Smooth gameplay mechanics</li>
    </ul>
  </div>
  <div style="background: #f8d7da; padding: 16px; border-radius: 8px;">
    <h3 style="color: #721c24; margin-top: 0;">Cons</h3>
    <ul style="margin-bottom: 0;">
      <li>Occasional performance issues</li>
      <li>Limited replay value</li>
      <li>Minor bugs present</li>
    </ul>
  </div>
</div>

<h2 style="color: #667eea; border-bottom: 3px solid #667eea; padding-bottom: 8px;">Final Verdict</h2>
<p>Summarize your overall thoughts and who would enjoy this game...</p>
<blockquote style="border-left: 4px solid #667eea; padding-left: 20px; font-style: italic; color: #555;">"A memorable experience that shouldn't be missed by fans of the genre."</blockquote>`
    },
    {
      id: 'game-announcement',
      name: 'Game Announcement',
      category: 'news',
      icon: Megaphone,
      description: 'Exciting game announcement or release',
      colorScheme: 'orange',
      content: `<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px; border-radius: 12px; color: white; text-align: center; margin-bottom: 24px;">
  <h1 style="margin: 0; font-size: 3em; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">BIG ANNOUNCEMENT</h1>
  <p style="margin: 16px 0 0 0; font-size: 1.5em;">Something amazing is coming!</p>
</div>

<h2 style="color: #f5576c; font-size: 2em;">Introducing: [Game Name]</h2>
<p style="font-size: 1.1em; line-height: 1.8;">We're thrilled to announce our latest project that will revolutionize the way you play...</p>

<div style="background: linear-gradient(to right, #fff5f5, #ffffff); border: 2px solid #f5576c; padding: 24px; border-radius: 12px; margin: 24px 0;">
  <h3 style="color: #f5576c; margin-top: 0;">What to Expect</h3>
  <ul style="line-height: 2; font-size: 1.05em;">
    <li><strong>Revolutionary Gameplay:</strong> Experience mechanics never seen before</li>
    <li><strong>Stunning Visuals:</strong> Next-generation graphics powered by cutting-edge technology</li>
    <li><strong>Epic Story:</strong> An immersive narrative that will keep you on the edge of your seat</li>
    <li><strong>Multiplayer Madness:</strong> Team up or compete with players worldwide</li>
  </ul>
</div>

<h2 style="color: #f5576c;">Release Information</h2>
<div style="background: #f5576c; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
  <p style="margin: 0; font-size: 1.3em;"><strong>Coming Soon</strong></p>
  <p style="margin: 8px 0 0 0; font-size: 1.1em;">Platform: PC, PlayStation, Xbox, Nintendo Switch</p>
</div>

<h2 style="color: #f5576c;">Stay Updated</h2>
<p>Follow us on social media and join our community to get the latest news, exclusive content, and early access opportunities!</p>

<blockquote style="background: #fff5f5; border-left: 4px solid #f5576c; padding: 20px; margin: 20px 0; border-radius: 4px; font-size: 1.1em;">"This is going to be our biggest game yet. We can't wait to share it with you!" - Development Team</blockquote>`
    },
    {
      id: 'game-walkthrough',
      name: 'Walkthrough Guide',
      category: 'guide',
      icon: Lightbulb,
      description: 'Step-by-step game walkthrough',
      colorScheme: 'green',
      content: `<h1 style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px;">Complete Walkthrough: [Game Name]</h1>

<div style="background: #fff3cd; border: 2px solid #ffc107; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
  <p style="margin: 0;"><strong>Note:</strong> This guide contains spoilers. Proceed at your own discretion.</p>
</div>

<h2 style="color: #11998e; border-bottom: 3px solid #11998e; padding-bottom: 8px;">Chapter 1: The Beginning</h2>

<h3 style="color: #38ef7d;">Section 1-1: Tutorial Area</h3>
<p><strong>Objective:</strong> Learn the basic controls and mechanics</p>

<div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 16px; margin: 16px 0; border-radius: 4px;">
  <h4 style="margin-top: 0; color: #2e7d32;">Step 1: Movement</h4>
  <p>Use WASD or arrow keys to move your character. Take a moment to familiarize yourself with the controls...</p>
</div>

<div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 16px; margin: 16px 0; border-radius: 4px;">
  <h4 style="margin-top: 0; color: #2e7d32;">Step 2: First Enemy</h4>
  <p>Approach the enemy and use your basic attack (spacebar). Watch for the enemy's attack pattern...</p>
</div>

<div style="background: #fff9c4; border: 1px solid #ffd54f; padding: 16px; margin: 16px 0; border-radius: 8px;">
  <h4 style="margin-top: 0; color: #f57c00;">Pro Tip</h4>
  <p style="margin-bottom: 0;">Save your special abilities for tougher enemies. Regular attacks are sufficient for basic foes.</p>
</div>

<h3 style="color: #38ef7d;">Section 1-2: First Boss</h3>
<p><strong>Boss Name:</strong> Guardian of the Gate</p>
<p><strong>Difficulty:</strong> Easy</p>

<div style="background: #e1f5fe; border-left: 4px solid #03a9f4; padding: 16px; margin: 16px 0; border-radius: 4px;">
  <h4 style="margin-top: 0; color: #01579b;">Strategy</h4>
  <ul style="margin-bottom: 0;">
    <li><strong>Phase 1:</strong> Dodge the sweeping attacks by rolling to the sides</li>
    <li><strong>Phase 2:</strong> Attack during the cooldown period after heavy attacks</li>
    <li><strong>Final Phase:</strong> Use your special ability when the boss is stunned</li>
  </ul>
</div>

<h2 style="color: #11998e; border-bottom: 3px solid #11998e; padding-bottom: 8px;">Collectibles & Secrets</h2>
<p><strong>Chapter 1 Collectibles:</strong> 5/5 required for 100% completion</p>
<ul>
  <li><strong>Secret #1:</strong> Hidden behind the waterfall near spawn</li>
  <li><strong>Secret #2:</strong> In the chest on top of the tower (requires climbing)</li>
  <li><strong>Secret #3:</strong> Reward for defeating all enemies without taking damage</li>
</ul>`
    },
    {
      id: 'game-tips',
      name: 'Gameplay Tips',
      category: 'guide',
      icon: Sparkles,
      description: 'Expert tips and tricks',
      colorScheme: 'purple',
      content: `<div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 32px; border-radius: 12px; margin-bottom: 24px;">
  <h1 style="margin: 0; color: #333; font-size: 2.5em;">Pro Tips & Tricks</h1>
  <p style="margin: 8px 0 0 0; color: #666; font-size: 1.2em;">Master the game with these expert strategies</p>
</div>

<h2 style="color: #9c27b0;">Getting Started</h2>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin: 24px 0;">
  <div style="background: #f3e5f5; padding: 20px; border-radius: 12px; border-top: 4px solid #9c27b0;">
    <h3 style="color: #9c27b0; margin-top: 0;">Tip #1: Resource Management</h3>
    <p style="margin-bottom: 0;">Always keep a reserve of healing items. Don't use everything in one battle - you never know what's around the corner.</p>
  </div>
  
  <div style="background: #e1f5fe; padding: 20px; border-radius: 12px; border-top: 4px solid #03a9f4;">
    <h3 style="color: #0288d1; margin-top: 0;">Tip #2: Explore Everything</h3>
    <p style="margin-bottom: 0;">Take time to explore every corner. Hidden paths often contain powerful items or shortcuts that make the game easier.</p>
  </div>
  
  <div style="background: #fff3e0; padding: 20px; border-radius: 12px; border-top: 4px solid #ff9800;">
    <h3 style="color: #f57c00; margin-top: 0;">Tip #3: Upgrade Wisely</h3>
    <p style="margin-bottom: 0;">Focus on upgrading one weapon fully before spreading resources thin. A maxed-out weapon is better than three mediocre ones.</p>
  </div>
</div>

<h2 style="color: #9c27b0;">Advanced Strategies</h2>

<div style="background: white; border: 2px solid #9c27b0; border-radius: 12px; padding: 24px; margin: 24px 0;">
  <h3 style="color: #9c27b0; margin-top: 0;">Combat Mastery</h3>
  <ul style="line-height: 2;">
    <li><strong>Learn Enemy Patterns:</strong> Every enemy has a tell before attacking. Master these to perfect your dodges</li>
    <li><strong>Combo System:</strong> Chain attacks for bonus damage. Light > Light > Heavy is a reliable starter combo</li>
    <li><strong>Environmental Advantages:</strong> Use the terrain to your benefit - high ground, cover, and obstacles</li>
    <li><strong>Status Effects:</strong> Don't underestimate poison, burn, and freeze effects on tough enemies</li>
  </ul>
</div>

<h2 style="color: #9c27b0;">Common Mistakes to Avoid</h2>

<div style="background: #ffebee; border-left: 4px solid #f44336; padding: 20px; margin: 20px 0; border-radius: 4px;">
  <ul style="margin: 0; line-height: 2;">
    <li><strong>Rushing Through:</strong> Take your time to learn mechanics properly</li>
    <li><strong>Ignoring Tutorials:</strong> Even experienced players can learn something new</li>
    <li><strong>Hoarding Items:</strong> Use your consumables - they're there to help you</li>
    <li><strong>Neglecting Defense:</strong> Sometimes the best offense is a good defense</li>
  </ul>
</div>

<blockquote style="background: linear-gradient(to right, #f3e5f5, #fff); border-left: 4px solid #9c27b0; padding: 20px; margin: 24px 0; border-radius: 4px; font-size: 1.1em; font-style: italic;">"The key to mastering any game is practice, patience, and learning from every defeat."</blockquote>`
    }
  ],
  programs: [
    {
      id: 'program-feature-list',
      name: 'Feature Showcase',
      category: 'features',
      icon: Sparkles,
      description: 'Highlight program features and capabilities',
      colorScheme: 'cyan',
      content: `<div style="background: linear-gradient(135deg, #0093E9 0%, #80D0C7 100%); padding: 40px; border-radius: 12px; color: white; margin-bottom: 32px;">
  <h1 style="margin: 0; font-size: 2.8em; font-weight: bold;">[Program Name]</h1>
  <p style="margin: 12px 0 0 0; font-size: 1.4em; opacity: 0.95;">Powerful features for everyone</p>
</div>

<p style="font-size: 1.15em; line-height: 1.8; color: #333;">Transform the way you work with our comprehensive suite of professional tools, all available completely free.</p>

<h2 style="color: #0093E9; font-size: 2em; margin-top: 32px;">Core Features</h2>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin: 32px 0;">
  <div style="background: white; border: 2px solid #0093E9; border-radius: 16px; padding: 24px; transition: transform 0.3s;">
    <div style="background: #e3f2fd; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
      <span style="font-size: 24px; color: #0093E9;">⚡</span>
    </div>
    <h3 style="color: #0093E9; margin: 0 0 12px 0;">Lightning Fast</h3>
    <p style="margin: 0; color: #666; line-height: 1.6;">Optimized performance ensures smooth operation even with large files and complex projects.</p>
  </div>

  <div style="background: white; border: 2px solid #0093E9; border-radius: 16px; padding: 24px;">
    <div style="background: #e3f2fd; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
      <span style="font-size: 24px; color: #0093E9;">🎨</span>
    </div>
    <h3 style="color: #0093E9; margin: 0 0 12px 0;">Intuitive Design</h3>
    <p style="margin: 0; color: #666; line-height: 1.6;">Clean, modern interface that's easy to learn and enjoyable to use every day.</p>
  </div>

  <div style="background: white; border: 2px solid #0093E9; border-radius: 16px; padding: 24px;">
    <div style="background: #e3f2fd; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
      <span style="font-size: 24px; color: #0093E9;">🔒</span>
    </div>
    <h3 style="color: #0093E9; margin: 0 0 12px 0;">Secure & Private</h3>
    <p style="margin: 0; color: #666; line-height: 1.6;">Your data stays yours. No tracking, no ads, no compromises on privacy.</p>
  </div>
</div>

<h2 style="color: #0093E9; font-size: 2em; margin-top: 32px;">What You Can Do</h2>

<div style="background: linear-gradient(to right, #e3f2fd, #ffffff); border-left: 5px solid #0093E9; padding: 24px; border-radius: 8px; margin: 24px 0;">
  <ul style="list-style: none; padding: 0; margin: 0;">
    <li style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; font-size: 1.1em;">
      <strong style="color: #0093E9;">Advanced Editing:</strong> Professional-grade tools at your fingertips
    </li>
    <li style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; font-size: 1.1em;">
      <strong style="color: #0093E9;">Multi-Format Support:</strong> Work with all popular file formats seamlessly
    </li>
    <li style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; font-size: 1.1em;">
      <strong style="color: #0093E9;">Batch Processing:</strong> Save time by processing multiple files at once
    </li>
    <li style="padding: 12px 0; font-size: 1.1em;">
      <strong style="color: #0093E9;">Cloud Integration:</strong> Sync your work across all devices effortlessly
    </li>
  </ul>
</div>

<div style="background: #0093E9; color: white; padding: 32px; border-radius: 16px; text-align: center; margin: 32px 0;">
  <h2 style="margin: 0 0 16px 0; font-size: 2em;">100% Free Forever</h2>
  <p style="margin: 0; font-size: 1.2em; opacity: 0.95;">No hidden costs, no premium tiers, no subscriptions</p>
</div>`
    },
    {
      id: 'program-tutorial',
      name: 'Tutorial Guide',
      category: 'tutorial',
      icon: Lightbulb,
      description: 'Step-by-step program tutorial',
      colorScheme: 'teal',
      content: `<h1 style="background: linear-gradient(135deg, #00b4db 0%, #0083b0 100%); color: white; padding: 32px; border-radius: 12px; margin-bottom: 32px; text-align: center; font-size: 2.5em;">Getting Started Tutorial</h1>

<div style="background: #e0f7fa; border: 2px solid #00acc1; padding: 20px; border-radius: 12px; margin-bottom: 32px;">
  <p style="margin: 0; font-size: 1.1em;"><strong>Estimated Time:</strong> 10-15 minutes</p>
  <p style="margin: 8px 0 0 0; font-size: 1.1em;"><strong>Difficulty:</strong> Beginner-friendly</p>
</div>

<h2 style="color: #00acc1; border-bottom: 3px solid #00acc1; padding-bottom: 12px;">Step 1: Installation & Setup</h2>

<div style="background: white; border-left: 5px solid #4caf50; padding: 24px; margin: 24px 0; border-radius: 4px;">
  <h3 style="margin-top: 0; color: #4caf50;">Installing the Program</h3>
  <ol style="line-height: 2; font-size: 1.05em;">
    <li>Download the installer from the official website</li>
    <li>Run the installer and follow the on-screen instructions</li>
    <li>Launch the program from your applications folder</li>
  </ol>
  <p style="margin: 16px 0 0 0; background: #f1f8e9; padding: 12px; border-radius: 6px;"><strong>Note:</strong> The first launch may take a few seconds as the program initializes.</p>
</div>

<h2 style="color: #00acc1; border-bottom: 3px solid #00acc1; padding-bottom: 12px;">Step 2: First Project</h2>

<div style="background: white; border-left: 5px solid #2196f3; padding: 24px; margin: 24px 0; border-radius: 4px;">
  <h3 style="margin-top: 0; color: #2196f3;">Creating Your First Project</h3>
  <ol style="line-height: 2; font-size: 1.05em;">
    <li><strong>Click "New Project"</strong> in the welcome screen</li>
    <li><strong>Choose a template</strong> or start from scratch</li>
    <li><strong>Configure settings</strong> according to your needs</li>
    <li><strong>Click "Create"</strong> to begin</li>
  </ol>
</div>

<div style="background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 12px; margin: 24px 0;">
  <h3 style="margin-top: 0; color: #f57c00;">Quick Tip</h3>
  <p style="margin: 0; font-size: 1.05em;">Use keyboard shortcuts to speed up your workflow. Press Ctrl+? (Cmd+? on Mac) to see all available shortcuts.</p>
</div>

<h2 style="color: #00acc1; border-bottom: 3px solid #00acc1; padding-bottom: 12px;">Step 3: Basic Operations</h2>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 24px 0;">
  <div style="background: #e8f5e9; padding: 20px; border-radius: 12px;">
    <h4 style="color: #2e7d32; margin-top: 0;">Import Files</h4>
    <p style="margin: 0;">Drag and drop files into the workspace or use File → Import</p>
  </div>
  
  <div style="background: #e3f2fd; padding: 20px; border-radius: 12px;">
    <h4 style="color: #1565c0; margin-top: 0;">Edit & Modify</h4>
    <p style="margin: 0;">Use the toolbar tools to make changes and adjustments</p>
  </div>
  
  <div style="background: #f3e5f5; padding: 20px; border-radius: 12px;">
    <h4 style="color: #6a1b9a; margin-top: 0;">Export Results</h4>
    <p style="margin: 0;">Save or export your work in your preferred format</p>
  </div>
</div>

<h2 style="color: #00acc1; border-bottom: 3px solid #00acc1; padding-bottom: 12px;">Next Steps</h2>

<div style="background: linear-gradient(to right, #e0f7fa, #ffffff); padding: 24px; border-radius: 12px; margin: 24px 0;">
  <ul style="line-height: 2; font-size: 1.05em;">
    <li>Explore the advanced features in the Help menu</li>
    <li>Watch video tutorials for specific tasks</li>
    <li>Join our community forum for tips and support</li>
    <li>Customize the interface to match your workflow</li>
  </ul>
</div>

<blockquote style="background: #00acc1; color: white; padding: 24px; border-radius: 12px; margin: 24px 0; font-size: 1.2em; text-align: center; font-style: italic;">"The best way to learn is by doing. Don't be afraid to experiment!"</blockquote>`
    },
    {
      id: 'program-overview',
      name: 'Program Overview',
      category: 'overview',
      icon: Package,
      description: 'Comprehensive program overview',
      colorScheme: 'indigo',
      content: `<div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 16px; margin-bottom: 32px;">
  <h1 style="margin: 0; font-size: 3em; font-weight: bold;">[Program Name]</h1>
  <p style="margin: 16px 0 0 0; font-size: 1.3em; opacity: 0.95;">Professional software, absolutely free</p>
</div>

<h2 style="color: #667eea; font-size: 2.2em;">What is [Program Name]?</h2>
<p style="font-size: 1.15em; line-height: 1.8; color: #555;">[Program Name] is a powerful, user-friendly application designed to help you accomplish your tasks efficiently. Whether you're a beginner or a professional, our software provides all the tools you need.</p>

<h2 style="color: #667eea; font-size: 2.2em; margin-top: 40px;">Key Capabilities</h2>

<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin: 32px 0;">
  <div style="background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%); padding: 32px; border-radius: 16px; border: 2px solid #667eea;">
    <h3 style="color: #667eea; margin-top: 0; font-size: 1.5em;">Easy to Use</h3>
    <p style="margin: 0; line-height: 1.7; font-size: 1.05em;">Intuitive interface designed for users of all skill levels. Get started in minutes without a steep learning curve.</p>
  </div>
  
  <div style="background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%); padding: 32px; border-radius: 16px; border: 2px solid #667eea;">
    <h3 style="color: #667eea; margin-top: 0; font-size: 1.5em;">Fast Performance</h3>
    <p style="margin: 0; line-height: 1.7; font-size: 1.05em;">Optimized for speed and efficiency. Handle large projects without lag or delays.</p>
  </div>
  
  <div style="background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%); padding: 32px; border-radius: 16px; border: 2px solid #667eea;">
    <h3 style="color: #667eea; margin-top: 0; font-size: 1.5em;">Regular Updates</h3>
    <p style="margin: 0; line-height: 1.7; font-size: 1.05em;">Continuous improvements and new features added based on user feedback.</p>
  </div>
  
  <div style="background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%); padding: 32px; border-radius: 16px; border: 2px solid #667eea;">
    <h3 style="color: #667eea; margin-top: 0; font-size: 1.5em;">Free Forever</h3>
    <p style="margin: 0; line-height: 1.7; font-size: 1.05em;">No hidden costs, no subscriptions, no premium versions. Completely free to use.</p>
  </div>
</div>

<h2 style="color: #667eea; font-size: 2.2em; margin-top: 40px;">Perfect For</h2>

<div style="background: white; border: 3px solid #667eea; border-radius: 16px; padding: 32px; margin: 32px 0;">
  <ul style="list-style: none; padding: 0; margin: 0;">
    <li style="padding: 16px; border-bottom: 2px solid #e0e0e0; font-size: 1.1em;">
      <strong style="color: #667eea;">Students:</strong> Complete assignments and projects with professional tools
    </li>
    <li style="padding: 16px; border-bottom: 2px solid #e0e0e0; font-size: 1.1em;">
      <strong style="color: #667eea;">Professionals:</strong> Enhance your workflow with advanced features
    </li>
    <li style="padding: 16px; border-bottom: 2px solid #e0e0e0; font-size: 1.1em;">
      <strong style="color: #667eea;">Creators:</strong> Bring your creative vision to life
    </li>
    <li style="padding: 16px; font-size: 1.1em;">
      <strong style="color: #667eea;">Businesses:</strong> Streamline operations without expensive software licenses
    </li>
  </ul>
</div>

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 16px; text-align: center; margin: 32px 0;">
  <h2 style="margin: 0 0 16px 0; font-size: 2.2em;">Ready to Get Started?</h2>
  <p style="margin: 0; font-size: 1.3em; opacity: 0.95;">Download now and experience the difference</p>
</div>`
    },
    {
      id: 'program-release-notes',
      name: 'Release Notes',
      category: 'news',
      icon: Newspaper,
      description: 'Version update and release notes',
      colorScheme: 'blue',
      content: `<div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 40px; border-radius: 12px; color: white; margin-bottom: 32px;">
  <h1 style="margin: 0; font-size: 2.5em;">Version 2.0 Release Notes</h1>
  <p style="margin: 12px 0 0 0; font-size: 1.2em; opacity: 0.9;">Released: October 30, 2025</p>
</div>

<div style="background: #e8f5e9; border-left: 5px solid #4caf50; padding: 24px; border-radius: 8px; margin: 32px 0;">
  <h2 style="color: #2e7d32; margin-top: 0;">What's New</h2>
  <p style="font-size: 1.1em; margin-bottom: 20px;">This major update brings powerful new features and significant performance improvements.</p>
</div>

<h2 style="color: #2a5298; font-size: 2em; border-bottom: 3px solid #2a5298; padding-bottom: 12px;">New Features</h2>

<div style="margin: 24px 0;">
  <div style="background: white; border: 2px solid #2a5298; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
    <h3 style="color: #2a5298; margin-top: 0;">Advanced Editor</h3>
    <p style="line-height: 1.8; margin: 12px 0;">Complete redesign of the editing interface with new tools, improved responsiveness, and customizable layouts.</p>
    <p style="background: #e3f2fd; padding: 12px; border-radius: 6px; margin: 0;"><strong>Key Highlight:</strong> 50% faster editing workflow</p>
  </div>

  <div style="background: white; border: 2px solid #2a5298; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
    <h3 style="color: #2a5298; margin-top: 0;">Cloud Sync</h3>
    <p style="line-height: 1.8; margin: 12px 0;">Seamlessly sync your projects across all devices. Start on desktop, continue on mobile.</p>
    <p style="background: #e3f2fd; padding: 12px; border-radius: 6px; margin: 0;"><strong>Key Highlight:</strong> Real-time synchronization</p>
  </div>

  <div style="background: white; border: 2px solid #2a5298; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
    <h3 style="color: #2a5298; margin-top: 0;">AI-Powered Suggestions</h3>
    <p style="line-height: 1.8; margin: 12px 0;">Intelligent recommendations to help you work faster and smarter.</p>
    <p style="background: #e3f2fd; padding: 12px; border-radius: 6px; margin: 0;"><strong>Key Highlight:</strong> Machine learning integration</p>
  </div>
</div>

<h2 style="color: #2a5298; font-size: 2em; border-bottom: 3px solid #2a5298; padding-bottom: 12px;">Improvements</h2>

<div style="background: linear-gradient(to right, #e3f2fd, #ffffff); padding: 24px; border-radius: 12px; margin: 24px 0;">
  <ul style="line-height: 2; font-size: 1.05em;">
    <li><strong>Performance:</strong> 40% reduction in load times</li>
    <li><strong>Memory:</strong> 30% less memory usage for large projects</li>
    <li><strong>UI/UX:</strong> Refreshed design with dark mode support</li>
    <li><strong>Accessibility:</strong> Enhanced keyboard navigation and screen reader support</li>
    <li><strong>Compatibility:</strong> Support for latest file formats</li>
  </ul>
</div>

<h2 style="color: #2a5298; font-size: 2em; border-bottom: 3px solid #2a5298; padding-bottom: 12px;">Bug Fixes</h2>

<div style="background: #fff3e0; border: 2px solid #ff9800; padding: 20px; border-radius: 12px; margin: 24px 0;">
  <ul style="margin: 0; line-height: 2;">
    <li>Fixed crash when opening large files</li>
    <li>Resolved export issues with specific formats</li>
    <li>Corrected display problems on high-DPI screens</li>
    <li>Fixed synchronization conflicts</li>
    <li>Addressed memory leaks in long sessions</li>
  </ul>
</div>

<h2 style="color: #2a5298; font-size: 2em; border-bottom: 3px solid #2a5298; padding-bottom: 12px;">Known Issues</h2>

<div style="background: #ffebee; border-left: 5px solid #f44336; padding: 20px; border-radius: 8px; margin: 24px 0;">
  <ul style="margin: 0; line-height: 2;">
    <li>Minor UI glitches on certain Linux distributions (fix coming in 2.0.1)</li>
    <li>Cloud sync may be slow on limited bandwidth connections</li>
  </ul>
</div>

<div style="background: #2a5298; color: white; padding: 32px; border-radius: 16px; text-align: center; margin: 32px 0;">
  <h2 style="margin: 0 0 16px 0;">Thank You!</h2>
  <p style="margin: 0; font-size: 1.1em;">We appreciate your continued support and feedback</p>
</div>`
    }
  ],
  blog: [
    {
      id: 'blog-news',
      name: 'News Article',
      category: 'news',
      icon: Newspaper,
      description: 'Breaking news or announcement',
      colorScheme: 'red',
      content: `<div style="background: linear-gradient(135deg, #ee0979 0%, #ff6a00 100%); padding: 48px 32px; border-radius: 16px; color: white; margin-bottom: 32px;">
  <div style="background: white; color: #ee0979; display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-bottom: 16px;">BREAKING NEWS</div>
  <h1 style="margin: 16px 0 0 0; font-size: 2.8em; font-weight: bold; line-height: 1.2;">Your Headline Goes Here</h1>
  <p style="margin: 16px 0 0 0; font-size: 1.2em; opacity: 0.95;">Brief subheadline providing context</p>
</div>

<p style="font-size: 1.2em; line-height: 1.8; color: #333; font-style: italic; border-left: 4px solid #ee0979; padding-left: 20px; margin: 24px 0;">Start with a compelling lead paragraph that captures the essence of your news story and hooks the reader immediately...</p>

<h2 style="color: #ee0979; font-size: 2em;">The Full Story</h2>
<p style="font-size: 1.05em; line-height: 1.8;">Provide the comprehensive details of your news story. Include who, what, when, where, why, and how...</p>

<div style="background: #fff5f5; border: 2px solid #ee0979; padding: 24px; border-radius: 12px; margin: 32px 0;">
  <h3 style="color: #ee0979; margin-top: 0;">Key Points</h3>
  <ul style="line-height: 2; font-size: 1.05em; margin-bottom: 0;">
    <li>Important detail or fact #1</li>
    <li>Important detail or fact #2</li>
    <li>Important detail or fact #3</li>
    <li>Important detail or fact #4</li>
  </ul>
</div>

<h2 style="color: #ee0979; font-size: 2em;">What This Means</h2>
<p style="font-size: 1.05em; line-height: 1.8;">Analyze the implications and significance of this news. How does it affect readers? What are the broader consequences?</p>

<blockquote style="background: linear-gradient(to right, #fff5f5, #ffffff); border-left: 5px solid #ee0979; padding: 24px; margin: 32px 0; border-radius: 8px; font-size: 1.2em; font-style: italic;">"Add a relevant quote from an expert, stakeholder, or involved party"<br><span style="font-size: 0.9em; color: #666; font-style: normal;">- Source Name, Title</span></blockquote>

<h2 style="color: #ee0979; font-size: 2em;">Looking Ahead</h2>
<p style="font-size: 1.05em; line-height: 1.8;">Discuss what comes next. What developments can we expect? What should readers watch for?</p>

<div style="background: #ee0979; color: white; padding: 24px; border-radius: 12px; text-align: center; margin: 32px 0;">
  <p style="margin: 0; font-size: 1.1em;"><strong>Stay Updated:</strong> Follow us for the latest developments on this story</p>
</div>`
    },
    {
      id: 'blog-tutorial-detailed',
      name: 'Detailed Tutorial',
      category: 'tutorial',
      icon: Lightbulb,
      description: 'Comprehensive tutorial guide',
      colorScheme: 'green',
      content: `<div style="background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%); padding: 40px; border-radius: 16px; color: white; text-align: center; margin-bottom: 32px;">
  <h1 style="margin: 0; font-size: 2.8em; font-weight: bold;">Complete Guide: [Topic]</h1>
  <p style="margin: 16px 0 0 0; font-size: 1.3em; opacity: 0.95;">Master this skill step by step</p>
</div>

<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 32px 0;">
  <div style="background: #e8f5e9; padding: 20px; border-radius: 12px; text-align: center;">
    <div style="font-size: 2em; margin-bottom: 8px;">⏱️</div>
    <div style="font-weight: bold; color: #2e7d32;">30 Minutes</div>
    <div style="font-size: 0.9em; color: #666;">Estimated Time</div>
  </div>
  <div style="background: #fff3e0; padding: 20px; border-radius: 12px; text-align: center;">
    <div style="font-size: 2em; margin-bottom: 8px;">📊</div>
    <div style="font-weight: bold; color: #f57c00;">Intermediate</div>
    <div style="font-size: 0.9em; color: #666;">Difficulty Level</div>
  </div>
  <div style="background: #e3f2fd; padding: 20px; border-radius: 12px; text-align: center;">
    <div style="font-size: 2em; margin-bottom: 8px;">🎯</div>
    <div style="font-weight: bold; color: #1565c0;">Hands-On</div>
    <div style="font-size: 0.9em; color: #666;">Learning Style</div>
  </div>
</div>

<h2 style="color: #56ab2f; font-size: 2.2em;">What You'll Learn</h2>
<div style="background: linear-gradient(to right, #e8f5e9, #ffffff); padding: 24px; border-radius: 12px; margin: 24px 0;">
  <ul style="line-height: 2.2; font-size: 1.05em; margin: 0;">
    <li>Core concept and fundamentals</li>
    <li>Practical applications and examples</li>
    <li>Advanced techniques and best practices</li>
    <li>Common pitfalls and how to avoid them</li>
  </ul>
</div>

<h2 style="color: #56ab2f; font-size: 2.2em;">Prerequisites</h2>
<div style="background: #fff9c4; border-left: 5px solid #fbc02d; padding: 20px; border-radius: 8px; margin: 24px 0;">
  <ul style="margin: 0; line-height: 2;">
    <li>Basic understanding of [related topic]</li>
    <li>Required tools or software installed</li>
    <li>Willingness to learn and practice</li>
  </ul>
</div>

<h2 style="color: #56ab2f; font-size: 2.2em; margin-top: 40px;">Step 1: Foundation</h2>
<div style="background: white; border: 3px solid #56ab2f; border-radius: 16px; padding: 32px; margin: 24px 0;">
  <h3 style="color: #56ab2f; margin-top: 0;">Understanding the Basics</h3>
  <p style="line-height: 1.8; font-size: 1.05em;">Start by explaining the fundamental concepts. Make sure readers have a solid foundation before moving forward...</p>
  
  <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin-top: 20px;">
    <p style="margin: 0; font-weight: bold; color: #2e7d32;">Quick Exercise:</p>
    <p style="margin: 8px 0 0 0;">Try this simple task to verify your understanding...</p>
  </div>
</div>

<h2 style="color: #56ab2f; font-size: 2.2em;">Step 2: Hands-On Practice</h2>
<div style="background: white; border: 3px solid #56ab2f; border-radius: 16px; padding: 32px; margin: 24px 0;">
  <h3 style="color: #56ab2f; margin-top: 0;">Building Your First Project</h3>
  <p style="line-height: 1.8; font-size: 1.05em;">Now that you understand the basics, let's create something practical...</p>
  
  <ol style="line-height: 2; font-size: 1.05em;">
    <li><strong>First action:</strong> Detailed explanation...</li>
    <li><strong>Second action:</strong> Detailed explanation...</li>
    <li><strong>Third action:</strong> Detailed explanation...</li>
  </ol>
</div>

<div style="background: #e8f5e9; border: 2px solid #66bb6a; padding: 24px; border-radius: 12px; margin: 32px 0;">
  <h3 style="color: #2e7d32; margin-top: 0;">Pro Tips</h3>
  <ul style="margin: 0; line-height: 2;">
    <li><strong>Tip 1:</strong> Expert advice for better results</li>
    <li><strong>Tip 2:</strong> Time-saving shortcut</li>
    <li><strong>Tip 3:</strong> Common mistake to avoid</li>
  </ul>
</div>

<h2 style="color: #56ab2f; font-size: 2.2em;">Step 3: Advanced Techniques</h2>
<div style="background: white; border: 3px solid #56ab2f; border-radius: 16px; padding: 32px; margin: 24px 0;">
  <h3 style="color: #56ab2f; margin-top: 0;">Taking It Further</h3>
  <p style="line-height: 1.8; font-size: 1.05em;">Once you're comfortable with the basics, explore these advanced concepts...</p>
</div>

<div style="background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%); color: white; padding: 40px; border-radius: 16px; text-align: center; margin: 32px 0;">
  <h2 style="margin: 0 0 16px 0; font-size: 2.2em;">Congratulations!</h2>
  <p style="margin: 0; font-size: 1.2em; opacity: 0.95;">You've completed the tutorial. Keep practicing to master this skill!</p>
</div>`
    },
    {
      id: 'blog-analysis',
      name: 'Analysis Article',
      category: 'analysis',
      icon: FileText,
      description: 'In-depth analysis and insights',
      colorScheme: 'purple',
      content: `<h1 style="background: linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%); color: white; padding: 48px 32px; border-radius: 16px; margin-bottom: 32px; font-size: 2.8em; line-height: 1.3;">Deep Dive: [Topic Analysis]</h1>

<p style="font-size: 1.25em; line-height: 1.8; color: #555; font-style: italic; margin: 32px 0;">Opening statement that frames the analysis and explains why this topic matters...</p>

<h2 style="color: #8e2de2; font-size: 2.2em; border-bottom: 3px solid #8e2de2; padding-bottom: 12px;">The Current Landscape</h2>

<p style="font-size: 1.05em; line-height: 1.8;">Set the stage by describing the current situation, trends, and relevant context...</p>

<div style="background: linear-gradient(to right, #f3e5f5, #ffffff); border-left: 5px solid #8e2de2; padding: 24px; border-radius: 8px; margin: 32px 0;">
  <h3 style="color: #8e2de2; margin-top: 0;">Key Statistics</h3>
  <ul style="line-height: 2; font-size: 1.05em; margin-bottom: 0;">
    <li><strong>Data Point 1:</strong> Significant finding with context</li>
    <li><strong>Data Point 2:</strong> Another important metric</li>
    <li><strong>Data Point 3:</strong> Trend or comparison</li>
  </ul>
</div>

<h2 style="color: #8e2de2; font-size: 2.2em; border-bottom: 3px solid #8e2de2; padding-bottom: 12px;">Analysis Framework</h2>

<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin: 32px 0;">
  <div style="background: white; border: 2px solid #8e2de2; border-radius: 12px; padding: 32px;">
    <h3 style="color: #8e2de2; margin-top: 0; font-size: 1.5em;">Factor 1: [Aspect]</h3>
    <p style="line-height: 1.8; margin-bottom: 0;">Detailed analysis of this particular factor and its implications...</p>
  </div>
  
  <div style="background: white; border: 2px solid #8e2de2; border-radius: 12px; padding: 32px;">
    <h3 style="color: #8e2de2; margin-top: 0; font-size: 1.5em;">Factor 2: [Aspect]</h3>
    <p style="line-height: 1.8; margin-bottom: 0;">Examination of another critical element affecting the situation...</p>
  </div>
  
  <div style="background: white; border: 2px solid #8e2de2; border-radius: 12px; padding: 32px;">
    <h3 style="color: #8e2de2; margin-top: 0; font-size: 1.5em;">Factor 3: [Aspect]</h3>
    <p style="line-height: 1.8; margin-bottom: 0;">Analysis of third major component and its role...</p>
  </div>
  
  <div style="background: white; border: 2px solid #8e2de2; border-radius: 12px; padding: 32px;">
    <h3 style="color: #8e2de2; margin-top: 0; font-size: 1.5em;">Factor 4: [Aspect]</h3>
    <p style="line-height: 1.8; margin-bottom: 0;">Exploration of the final key element...</p>
  </div>
</div>

<h2 style="color: #8e2de2; font-size: 2.2em; border-bottom: 3px solid #8e2de2; padding-bottom: 12px;">Critical Insights</h2>

<div style="background: #8e2de2; color: white; padding: 32px; border-radius: 16px; margin: 32px 0;">
  <h3 style="margin-top: 0; font-size: 1.8em;">Insight #1</h3>
  <p style="line-height: 1.8; font-size: 1.1em; margin-bottom: 24px;">Deep dive into a major finding or realization...</p>
  
  <h3 style="font-size: 1.8em;">Insight #2</h3>
  <p style="line-height: 1.8; font-size: 1.1em; margin-bottom: 24px;">Another significant observation and its meaning...</p>
  
  <h3 style="font-size: 1.8em;">Insight #3</h3>
  <p style="line-height: 1.8; font-size: 1.1em; margin-bottom: 0;">Third crucial takeaway from the analysis...</p>
</div>

<h2 style="color: #8e2de2; font-size: 2.2em; border-bottom: 3px solid #8e2de2; padding-bottom: 12px;">Implications & Future Outlook</h2>

<p style="font-size: 1.05em; line-height: 1.8;">Discuss what these findings mean for the future. What changes can we expect? What should stakeholders do?</p>

<div style="background: linear-gradient(to right, #f3e5f5, #fff); padding: 32px; border-radius: 12px; margin: 32px 0;">
  <h3 style="color: #8e2de2; margin-top: 0;">Recommendations</h3>
  <ol style="line-height: 2; font-size: 1.05em; margin-bottom: 0;">
    <li><strong>Short-term action:</strong> Immediate steps to take</li>
    <li><strong>Medium-term strategy:</strong> Plans for the coming months</li>
    <li><strong>Long-term vision:</strong> Where to focus for sustained success</li>
  </ol>
</div>

<blockquote style="background: white; border: 3px solid #8e2de2; padding: 32px; margin: 32px 0; border-radius: 12px; font-size: 1.25em; line-height: 1.8; font-style: italic; text-align: center;">"Understanding these dynamics is crucial for anyone looking to navigate this landscape successfully."</blockquote>`
    },
    {
      id: 'blog-opinion',
      name: 'Opinion Editorial',
      category: 'opinion',
      icon: Newspaper,
      description: 'Opinion piece or editorial',
      colorScheme: 'amber',
      content: `<div style="background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%); padding: 48px 32px; border-radius: 16px; color: white; margin-bottom: 32px;">
  <div style="font-size: 0.9em; opacity: 0.9; margin-bottom: 8px; letter-spacing: 2px;">OPINION</div>
  <h1 style="margin: 0; font-size: 2.8em; font-weight: bold; line-height: 1.3;">Your Thought-Provoking Title</h1>
  <p style="margin: 16px 0 0 0; font-size: 1.2em; opacity: 0.95;">A perspective on [topic]</p>
</div>

<div style="border-left: 5px solid #ffd89b; padding-left: 24px; font-size: 1.2em; line-height: 1.8; color: #333; font-style: italic; margin: 32px 0;">
  <p style="margin: 0;">Start with a bold statement or question that captures your main argument and immediately engages readers...</p>
</div>

<h2 style="color: #19547b; font-size: 2.2em;">Setting the Stage</h2>
<p style="font-size: 1.05em; line-height: 1.8;">Provide context and background. Why is this topic important? What prompted you to write about it?</p>

<h2 style="color: #19547b; font-size: 2.2em;">My Perspective</h2>

<div style="background: #fff8e1; border: 3px solid #ffd89b; border-radius: 16px; padding: 32px; margin: 32px 0;">
  <p style="font-size: 1.15em; line-height: 1.9; margin: 0;">Present your main argument clearly and forcefully. Support it with logic, evidence, and personal insight. Be authentic and don't shy away from strong positions...</p>
</div>

<h2 style="color: #19547b; font-size: 2.2em;">The Counter-Argument</h2>
<p style="font-size: 1.05em; line-height: 1.8;">Acknowledge opposing viewpoints fairly. Show that you've considered other perspectives...</p>

<div style="background: #e1f5fe; border-left: 5px solid #03a9f4; padding: 24px; border-radius: 8px; margin: 32px 0;">
  <p style="margin: 0; font-size: 1.05em; line-height: 1.8;"><strong>The opposition argues:</strong> [Counter-argument presented fairly]</p>
</div>

<h2 style="color: #19547b; font-size: 2.2em;">Why I Disagree</h2>
<p style="font-size: 1.05em; line-height: 1.8;">Respectfully rebut the counter-arguments. Explain why your position is more compelling...</p>

<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 32px 0;">
  <div style="background: linear-gradient(135deg, #fff8e1, #ffffff); padding: 24px; border-radius: 12px; border-top: 4px solid #ffd89b;">
    <h3 style="color: #f57c00; margin-top: 0;">Reason 1</h3>
    <p style="margin: 0; line-height: 1.7;">Key supporting point for your argument</p>
  </div>
  
  <div style="background: linear-gradient(135deg, #fff8e1, #ffffff); padding: 24px; border-radius: 12px; border-top: 4px solid #ffd89b;">
    <h3 style="color: #f57c00; margin-top: 0;">Reason 2</h3>
    <p style="margin: 0; line-height: 1.7;">Another compelling piece of evidence</p>
  </div>
  
  <div style="background: linear-gradient(135deg, #fff8e1, #ffffff); padding: 24px; border-radius: 12px; border-top: 4px solid #ffd89b;">
    <h3 style="color: #f57c00; margin-top: 0;">Reason 3</h3>
    <p style="margin: 0; line-height: 1.7;">Final supporting argument</p>
  </div>
</div>

<h2 style="color: #19547b; font-size: 2.2em;">The Bigger Picture</h2>
<p style="font-size: 1.05em; line-height: 1.8;">Zoom out and discuss the broader implications. What does this mean for society, the industry, or the future?</p>

<blockquote style="background: linear-gradient(135deg, #19547b, #0a3e5f); color: white; padding: 40px; border-radius: 16px; margin: 32px 0; font-size: 1.3em; line-height: 1.8; text-align: center; font-style: italic;">"A memorable quote that encapsulates your main point"</blockquote>

<h2 style="color: #19547b; font-size: 2.2em;">Moving Forward</h2>
<p style="font-size: 1.05em; line-height: 1.8;">Conclude with a call to action or thought-provoking question. What should readers think about? What actions should they take?</p>

<div style="background: #fff8e1; border: 2px solid #ffd89b; padding: 24px; border-radius: 12px; margin: 32px 0;">
  <p style="margin: 0; font-size: 1.1em; line-height: 1.8;"><strong>Final Thought:</strong> Leave readers with something to ponder that reinforces your main argument...</p>
</div>`
    }
  ]
};

export default function ContentTemplates({
  isOpen,
  onClose,
  onTemplateSelect,
  contentType
}: ContentTemplatesProps) {
  if (!isOpen) return null;

  const templates = TEMPLATES[contentType] || [];

  // Group templates by category for better organization
  const categories = Array.from(new Set(templates.map(t => t.category)));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
          <h2 className="text-3xl font-bold text-gray-900">Premium Content Templates</h2>
          <p className="text-gray-600 mt-2 text-lg">
            Choose from 12+ professionally designed templates
          </p>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto flex-1">
          {categories.map((category) => {
            const categoryTemplates = templates.filter(t => t.category === category);
            return (
              <div key={category} className="mb-8 last:mb-0">
                <h3 className="text-xl font-bold text-gray-800 mb-4 capitalize border-b-2 border-gray-200 pb-2">
                  {category} Templates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryTemplates.map((template) => {
                    const Icon = template.icon;
                    return (
                      <button
                        key={template.id}
                        onClick={() => {
                          onTemplateSelect(template.content);
                          onClose();
                        }}
                        className="text-left p-5 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-lg transition-all duration-200 group bg-white"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-200">
                            <Icon size={28} className="text-indigo-600 group-hover:text-white transition-colors" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg mb-1 text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {template.name}
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {templates.length} templates available for {contentType}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}