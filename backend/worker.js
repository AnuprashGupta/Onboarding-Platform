/**
 * Cloudflare Worker - Onboarding Platform Backend
 * 
 * This worker provides a simple backend for the onboarding platform.
 * It uses Cloudflare KV for data storage.
 * 
 * Setup Instructions:
 * 1. Create a Cloudflare Worker at workers.cloudflare.com
 * 2. Create a KV namespace called "ONBOARDING_DATA"
 * 3. Bind the KV namespace to this worker
 * 4. Deploy this code to your worker
 * 
 * KV Binding: ONBOARDING_DATA
 */

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Session-ID',
  'Access-Control-Max-Age': '86400',
};

// Handle CORS preflight
function handleOptions(request) {
  return new Response(null, {
    headers: corsHeaders,
  });
}

// Generate unique ID
function generateId() {
  return `onboard_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Validate onboarding data
function validateOnboardingData(data) {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Invalid email format');
    }
  }

  if (!data.startDate || typeof data.startDate !== 'string') {
    errors.push('Start date is required');
  }

  if (!data.documents || !Array.isArray(data.documents) || data.documents.length === 0) {
    errors.push('At least one document is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Handle POST /api/onboard
async function handleSubmitOnboarding(request, env) {
  try {
    console.log('📥 Received onboarding submission request');
    const data = await request.json();
    console.log('📋 Data received:', { name: data.name, email: data.email, documentCount: data.documents?.length });
    
    // Validate data
    const validation = validateOnboardingData(data);
    console.log('✅ Validation result:', validation.valid ? 'PASSED' : 'FAILED', validation.errors);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: validation.errors.join(', '),
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Generate ID and timestamps
    const id = generateId();
    const now = new Date().toISOString();
    console.log('🆔 Generated ID:', id);

    const onboardingData = {
      id,
      name: data.name,
      email: data.email,
      startDate: data.startDate,
      documents: data.documents.map(doc => ({
        name: doc.name,
        size: doc.size,
        mimeType: doc.mimeType,
        // Store base64 if provided (or store in R2 for production)
        base64: doc.base64 ? doc.base64.substring(0, 100) + '...[truncated]' : undefined,
      })),
      createdAt: now,
      updatedAt: now,
      submittedAt: data.submittedAt || now,
    };

    // Store in KV
    console.log('💾 Storing data in KV with ID:', id);
    await env.ONBOARDING_DATA.put(id, JSON.stringify(onboardingData), {
      metadata: {
        email: data.email,
        createdAt: now,
      },
    });
    console.log('✅ Data stored successfully!');

    // Also store by email for easy lookup
    console.log('📧 Creating email index:', `email:${data.email}`);
    await env.ONBOARDING_DATA.put(
      `email:${data.email}`,
      id,
      {
        expirationTtl: 60 * 60 * 24 * 30, // 30 days
      }
    );
    console.log('🎉 Onboarding completed successfully for:', data.name);

    return new Response(
      JSON.stringify({
        success: true,
        data: onboardingData,
        message: 'Onboarding submitted successfully',
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error submitting onboarding:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

// Handle GET /api/onboard/:id
async function handleGetOnboarding(id, env) {
  try {
    console.log('🔍 Fetching onboarding data for ID:', id);
    const data = await env.ONBOARDING_DATA.get(id);

    if (!data) {
      console.log('❌ Data not found for ID:', id);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Onboarding data not found',
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    console.log('✅ Data found and returning');
    return new Response(
      JSON.stringify({
        success: true,
        data: JSON.parse(data),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error getting onboarding:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

// Main fetch handler
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return handleOptions(request);
    }

    // Route requests
    if (path === '/api/onboard' && method === 'POST') {
      return handleSubmitOnboarding(request, env);
    }

    if (path.startsWith('/api/onboard/') && method === 'GET') {
      const id = path.split('/').pop();
      return handleGetOnboarding(id, env);
    }

    // Health check
    if (path === '/health' || path === '/') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          service: 'Onboarding Platform API',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // 404 for unknown routes
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Not found',
      }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  },
};



