/**
 * QUICK START: Adding Weak Points to Your Skills
 * 
 * This guide shows you how to quickly add weak points to your existing skills.
 */

// STEP 1: Import the examples
import { exampleWeakPoints } from '@/data/weakPointsExamples';

// STEP 2: Update your skill data with weak points
// Find where you define your skills/roadmap data and add weak points

export const sampleRoadmapWithWeakPoints = {
  phases: [
    {
      phase: "Phase 1: Foundations",
      skills: [
        {
          name: "React Hooks",
          description: "Master React's hooks API for state management and side effects",
          estimatedTime: "3-4 days",
          resources: [
            "https://react.dev/reference/react/hooks",
            "YouTube: React Hooks Tutorial"
          ],
          weakPoints: exampleWeakPoints.reactHooks, // ✨ ADD THIS LINE
          quiz: [
            {
              question: "What happens if you omit a dependency in useEffect?",
              options: ["Effect runs every render", "Effect uses stale values", "No effect"],
              correctAnswer: 1
            }
          ]
        },
        {
          name: "JavaScript ES6+",
          description: "Modern JavaScript features and best practices",
          estimatedTime: "2-3 days",
          weakPoints: exampleWeakPoints.javaScript, // ✨ ADD THIS LINE
          resources: [
            "https://javascript.info/"
          ]
        }
      ]
    }
  ]
};

// STEP 3: Creating Your Own Weak Points
// Use this template to create weak points for any concept

export const myCustomWeakPoint = {
  id: 'custom-weak-point-id',
  title: 'Title of the concept learners struggle with',
  summary: 'One-sentence explanation of the weak point',
  difficulty: 'intermediate' as const, // 'beginner' | 'intermediate' | 'advanced'
  
  // Why is this confusing? Explain the psychological/conceptual barrier
  whyLearnersStruggle: `
    Explain why learners find this concept difficult.
    What mental models conflict with the correct understanding?
    What prior knowledge creates confusion?
  `,
  
  // Common mistakes learners make
  commonMistakes: [
    'Mistake #1: Brief description',
    'Mistake #2: Brief description',
    'Mistake #3: Brief description'
  ],
  
  // Detailed technical explanation
  detailedExplanation: `
    Provide a comprehensive explanation of the concept.
    Use multiple paragraphs to break down different aspects.
    Include key principles and rules.
    
    Format tips:
    - Use bullet points for lists
    - Use code blocks for technical details
    - Be thorough but clear
  `,
  
  // Real-world examples with code
  realWorldExamples: [
    {
      title: 'Example 1: Common Mistake',
      description: 'This shows what beginners typically do wrong',
      code: `
        // ❌ WRONG - This demonstrates the mistake
        const example = () => {
          // Wrong approach
        };
      `,
      illustration: 'Diagram showing the problem' // Optional
    },
    {
      title: 'Example 2: Correct Approach',
      description: 'Here\'s the right way to do it',
      code: `
        // ✅ CORRECT - This is the proper approach
        const example = () => {
          // Correct implementation
        };
      `
    },
    {
      title: 'Example 3: Advanced Pattern',
      description: 'An advanced pattern that extends the concept',
      code: `
        // 🚀 ADVANCED - Using this pattern in production
        const example = () => {
          // Advanced usage
        };
      `
    }
  ],
  
  // Practical tips for mastery
  tips: [
    'First tip for understanding this concept',
    'Practice strategy or mental model that helps',
    'Common gotchas to watch out for',
    'Tools or techniques that make this easier',
    'Related concepts to study next'
  ]
};

// STEP 4: Organizing Weak Points
// Create files for each skill's weak points:

/*
src/data/
├── weakPointsExamples.ts    (provided examples)
├── weakPointsReact.ts        (your React weak points)
├── weakPointsJavaScript.ts   (your JS weak points)
└── weakPointsPython.ts       (your Python weak points)
*/

// Then import them like:
// import { reactWeakPoints } from '@/data/weakPointsReact';
// import { jsWeakPoints } from '@/data/weakPointsJavaScript';

// STEP 5: That's it! 🎉
// The UI components automatically handle:
// ✅ Displaying the bottom sheet
// ✅ Showing weak points in collapsible panel
// ✅ Navigating to detail pages on click
// ✅ Rendering code examples and tips
// ✅ Styling with difficulty colors
// ✅ Animations and responsive design

// COMMON PATTERNS FOR DIFFERENT SKILL TYPES

// ============================================
// Pattern 1: API/Library Weak Points
// ============================================
const apiWeakPoints = [
  {
    id: 'api-parameter-order',
    title: 'API Parameter Order and Overloads',
    summary: 'Confusing between different function overloads and parameter orders',
    difficulty: 'beginner' as const,
    commonMistakes: [
      'Passing parameters in wrong order',
      'Not understanding optional parameters',
      'Mixing positional and named arguments'
    ],
    realWorldExamples: [
      {
        title: 'Function Overload Example',
        description: 'Shows different ways to call the same function',
        code: `// Different overloads of the same function
array.slice(start, end)
array.slice(start)
array.slice()

// Same function, different parameters!`
      }
    ]
  }
];

// ============================================
// Pattern 2: Conceptual Weak Points
// ============================================
const conceptualWeakPoints = [
  {
    id: 'variable-scope',
    title: 'Understanding Variable Scope',
    summary: 'Confusion about where variables can be accessed',
    difficulty: 'intermediate' as const,
    whyLearnersStruggle: 'Scope is invisible - you can\'t see it but the rules are strict',
    realWorldExamples: [
      {
        title: 'Function vs Block Scope',
        description: 'JavaScript has two types of scope',
        code: `function outer() {
  var x = 1;    // Function scope
  let y = 2;    // Block scope
  if (true) {
    console.log(x); // 1 (accessible)
    console.log(y); // 2 (accessible)
  }
  console.log(x); // 1 (accessible)
  console.log(y); // 2 (accessible)
}`
      }
    ]
  }
];

// ============================================
// Pattern 3: Performance Weak Points
// ============================================
const performanceWeakPoints = [
  {
    id: 'react-rendering-performance',
    title: 'React Rendering Performance',
    summary: 'Understanding when and why components re-render',
    difficulty: 'advanced' as const,
    realWorldExamples: [
      {
        title: 'Unnecessary Re-renders',
        code: `// Parent re-renders, children re-render too
function Parent() {
  const [count, setCount] = useState(0);
  return <Child />; // Child re-renders on every Parent render!
}`
      }
    ]
  }
];

export { apiWeakPoints, conceptualWeakPoints, performanceWeakPoints };
