export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify access token
  const ACCESS_TOKEN = process.env.OUTRANK_ACCESS_TOKEN;
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }
  
  const token = authHeader.split(" ")[1];
  if (token !== ACCESS_TOKEN) {
    return res.status(401).json({ error: 'Invalid access token' });
  }

  try {
    const { event_type, timestamp, data } = req.body;
    
    if (event_type === 'publish_articles') {
      // Process the articles
      console.log(`Received ${data.articles.length} articles at ${timestamp}`);
      
      // Here you can add logic to:
      // - Save articles to your database
      // - Update your sitemap
      // - Trigger rebuilds
      // - Send notifications
      
      data.articles.forEach(article => {
        console.log(`Article: ${article.title} (${article.slug})`);
        // Process each article as needed
      });
    }
    
    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}