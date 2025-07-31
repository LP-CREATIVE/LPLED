// This script creates sample templates in the database
// Run this after setting up your Supabase database

const sampleTemplates = [
  {
    name: 'Welcome Message',
    description: 'A simple welcome message with customizable text',
    category: 'welcome',
    preview_url: '/templates/welcome.png',
    template_data: {
      icon: '👋',
      fields: [
        { type: 'text', label: 'Title', placeholder: 'Welcome!', key: 'title' },
        { type: 'text', label: 'Subtitle', placeholder: 'We\'re glad you\'re here', key: 'subtitle' },
        { type: 'color', label: 'Background Color', key: 'bgColor', default: '#1a1a1a' },
        { type: 'color', label: 'Text Color', key: 'textColor', default: '#ffffff' }
      ]
    },
    is_public: true
  },
  {
    name: 'Sale Announcement',
    description: 'Promote your sales and special offers',
    category: 'promotion',
    preview_url: '/templates/sale.png',
    template_data: {
      icon: '🏷️',
      fields: [
        { type: 'text', label: 'Sale Title', placeholder: 'MEGA SALE', key: 'title' },
        { type: 'text', label: 'Discount', placeholder: '50% OFF', key: 'discount' },
        { type: 'text', label: 'Valid Until', placeholder: 'This Weekend Only', key: 'validity' },
        { type: 'color', label: 'Accent Color', key: 'accentColor', default: '#ff0000' }
      ]
    },
    is_public: true
  },
  {
    name: 'Restaurant Menu',
    description: 'Display your daily specials or menu items',
    category: 'menu',
    preview_url: '/templates/menu.png',
    template_data: {
      icon: '🍽️',
      fields: [
        { type: 'text', label: 'Restaurant Name', placeholder: 'Joe\'s Diner', key: 'restaurant' },
        { type: 'text', label: 'Special Title', placeholder: 'Today\'s Special', key: 'title' },
        { type: 'textarea', label: 'Menu Items', placeholder: 'List your items here', key: 'items' },
        { type: 'text', label: 'Footer Text', placeholder: 'Ask your server for details', key: 'footer' }
      ]
    },
    is_public: true
  },
  {
    name: 'Event Countdown',
    description: 'Count down to your next big event',
    category: 'event',
    preview_url: '/templates/countdown.png',
    template_data: {
      icon: '⏰',
      fields: [
        { type: 'text', label: 'Event Name', placeholder: 'Grand Opening', key: 'eventName' },
        { type: 'text', label: 'Event Date', placeholder: 'December 25, 2024', key: 'eventDate' },
        { type: 'text', label: 'Location', placeholder: 'Main Street Plaza', key: 'location' },
        { type: 'color', label: 'Theme Color', key: 'themeColor', default: '#4a90e2' }
      ]
    },
    is_public: true
  },
  {
    name: 'Holiday Greeting',
    description: 'Spread holiday cheer with festive messages',
    category: 'holiday',
    preview_url: '/templates/holiday.png',
    template_data: {
      icon: '🎄',
      fields: [
        { type: 'text', label: 'Greeting', placeholder: 'Merry Christmas!', key: 'greeting' },
        { type: 'text', label: 'Message', placeholder: 'Wishing you joy and happiness', key: 'message' },
        { type: 'text', label: 'From', placeholder: 'Your Company Name', key: 'from' }
      ]
    },
    is_public: true
  },
  {
    name: 'Social Media Display',
    description: 'Show your social media handles',
    category: 'social',
    preview_url: '/templates/social.png',
    template_data: {
      icon: '📱',
      fields: [
        { type: 'text', label: 'Title', placeholder: 'Follow Us!', key: 'title' },
        { type: 'text', label: 'Instagram', placeholder: '@yourhandle', key: 'instagram' },
        { type: 'text', label: 'Facebook', placeholder: 'YourPage', key: 'facebook' },
        { type: 'text', label: 'Twitter/X', placeholder: '@yourhandle', key: 'twitter' }
      ]
    },
    is_public: true
  },
  {
    name: 'Business Hours',
    description: 'Display your operating hours',
    category: 'announcement',
    preview_url: '/templates/hours.png',
    template_data: {
      icon: '🕐',
      fields: [
        { type: 'text', label: 'Business Name', placeholder: 'Your Business', key: 'businessName' },
        { type: 'textarea', label: 'Hours', placeholder: 'Mon-Fri: 9AM-5PM\nSat-Sun: 10AM-4PM', key: 'hours' },
        { type: 'text', label: 'Special Note', placeholder: 'Closed on holidays', key: 'note' }
      ]
    },
    is_public: true
  },
  {
    name: 'Emergency Alert',
    description: 'Important announcements and alerts',
    category: 'announcement',
    preview_url: '/templates/alert.png',
    template_data: {
      icon: '🚨',
      fields: [
        { type: 'text', label: 'Alert Title', placeholder: 'ATTENTION', key: 'title' },
        { type: 'textarea', label: 'Message', placeholder: 'Important message here', key: 'message' },
        { type: 'color', label: 'Alert Color', key: 'alertColor', default: '#ff0000' }
      ]
    },
    is_public: true
  }
];

// SQL to insert these templates:
console.log(`
-- Insert sample templates
INSERT INTO templates (name, description, category, preview_url, template_data, is_public) VALUES
${sampleTemplates.map(t => 
  `('${t.name}', '${t.description}', '${t.category}', '${t.preview_url}', '${JSON.stringify(t.template_data).replace(/'/g, "''")}', ${t.is_public})`
).join(',\n')};
`);