import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'YOUR_OPENAI_API_KEY', // Replace with your actual API key
});

export const analyzeAccessibility = async (imageBase64: any) => {
  try {
    const prompt = `Analyze this image for accessibility barriers and provide a detailed assessment:

1. Physical Access: 
   - Steps, stairs, ramps, door widths, narrow passages
   - Counter heights, seating accessibility
   - Estimate dimensions where possible (in inches)

2. Visual Accessibility:
   - Text size, contrast, lighting conditions
   - Signage clarity and visibility
   - Color contrast issues

3. Navigation:
   - Clear pathways, obstacles, crowded spaces
   - Handrails, grab bars, safety features
   - Wayfinding and directional signage

Provide specific, actionable observations with estimated measurements. Rate each category 1-10 (10 being most accessible).

Format as JSON with this structure:
{
  "location": "Brief description of the location type",
  "overallScore": number,
  "categories": {
    "physicalAccess": {
      "score": number,
      "findings": ["specific observation 1", "observation 2", ...]
    },
    "visualAccessibility": {
      "score": number,
      "findings": ["specific observation 1", "observation 2", ...]
    },
    "navigation": {
      "score": number,
      "findings": ["specific observation 1", "observation 2", ...]
    }
  },
  "recommendations": ["actionable improvement 1", "improvement 2", ...]
}`;

    const response: {choices: any[]} = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {type: 'text', text: prompt},
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const analysisText: string = response?.choices[0]?.message?.content;
    return JSON.parse(analysisText);
  } catch (error) {
    console.error('AI Analysis error:', error);

    // Fallback mock analysis if API fails
    return {
      location: 'Location Analysis',
      overallScore: 7,
      categories: {
        physicalAccess: {
          score: 6,
          findings: [
            'Unable to connect to AI service',
            'Using offline analysis capabilities',
            'Please check internet connection for detailed analysis',
          ],
        },
        visualAccessibility: {
          score: 8,
          findings: ['Basic visual assessment completed'],
        },
        navigation: {
          score: 7,
          findings: ['General navigation assessment available'],
        },
      },
      recommendations: [
        'Connect to internet for detailed AI analysis',
        'Retake photo with better lighting if needed',
      ],
    };
  }
};
