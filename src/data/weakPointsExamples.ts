/**
 * Example Weak Points Data
 * 
 * This file provides sample weak point data structures that can be integrated
 * into your skill roadmap data. Each weak point includes:
 * - Common misconceptions learners have
 * - Real-world examples with code samples
 * - Practical tips for mastering the concept
 * 
 * Usage: Add weak points array to your Skill interface in the roadmap data
 */

export const exampleWeakPoints = {
  reactHooks: [
    {
      id: 'react-hooks-dependency-array',
      title: 'useEffect Dependency Array Pitfalls',
      summary: 'Missing or incorrect dependencies in useEffect hooks cause infinite loops and stale closures',
      difficulty: 'intermediate' as const,
      whyLearnersStruggle: `Learners often struggle with the dependency array because the relationship between closures and dependencies isn't immediately obvious. When a dependency is missing, the effect captures old values from the closure, leading to bugs. When all dependencies are omitted, the effect runs on every render. This creates a mental model gap between "when should my effect run" and "what do I list in dependencies".`,
      commonMistakes: [
        'Omitting dependencies to "fix" infinite loops instead of fixing the root cause',
        'Passing the entire object as a dependency instead of specific fields',
        'Mutating state in effects and updating the dependency array with that state',
        'Not understanding that functions in dependencies should be wrapped in useCallback',
        'Putting derived state in dependency array (like mapped or filtered arrays)',
      ],
      detailedExplanation: `The dependency array tells React which external values the effect depends on. If you reference a variable from outside the effect but don't include it in the array, the effect will use the old value from the first render.

This happens because effects create closures over the variables in their scope. When you update a dependency, React knows to re-run the effect with the new value.

Key principles:
1. Include ALL values from component scope that the effect uses
2. Functions used in effects should be wrapped with useCallback or defined inside the effect
3. Objects and arrays should be memoized or moved outside the component
4. If the dependency array is empty, the effect runs once after mount
5. If you omit the dependency array, the effect runs after every render`,
      realWorldExamples: [
        {
          title: 'Infinite Loop Example (Wrong)',
          description: 'This effect sets count state but has count in the dependency array, causing an infinite loop:',
          code: `// ❌ WRONG - Infinite loop
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(count + 1); // Updates count
  }, [count]); // count changed, effect runs again!

  return <div>{count}</div>;
}`,
        },
        {
          title: 'Missing Dependency Example (Bug)',
          description: 'This effect uses userId but doesn\'t include it in dependencies, so it uses stale data:',
          code: `// ❌ WRONG - Stale closure
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(\`/api/user/\${userId}\`)
      .then(r => r.json())
      .then(setUser);
  }, []); // Missing userId dependency!
  // If userId changes, effect doesn't re-run,
  // so old userId is used in the fetch

  return <div>{user?.name}</div>;
}`,
        },
        {
          title: 'Correct Implementation (Right)',
          description: 'Properly managing dependencies and cleanup:',
          code: `// ✅ CORRECT
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    fetch(\`/api/user/\${userId}\`)
      .then(r => r.json())
      .then(data => {
        if (isMounted) setUser(data);
      });

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [userId]); // Correct dependency!

  return <div>{user?.name}</div>;
}`,
        },
      ],
      tips: [
        'Use the ESLint rule "exhaustive-deps" to automatically detect missing dependencies',
        'If you get infinite loops, check if you\'re updating a dependency in the effect itself',
        'Extract callback functions to useCallback() if they\'re used in effects',
        'Consider moving state updates outside effects using custom hooks',
        'Always include a cleanup function to prevent memory leaks with async operations',
        'Use the React DevTools Profiler to visualize when effects are running',
      ],
    },
    {
      id: 'react-hooks-closure',
      title: 'Closures and Stale Values in Event Handlers',
      summary: 'Event handlers capture old state values due to JavaScript closures',
      difficulty: 'advanced' as const,
      whyLearnersStruggle: `JavaScript closures are not specific to React, but React makes this problem very visible. A new function is created on every render, and it "closes over" the current values of state and props. But event handlers often need the latest values, creating confusion about when to use useCallback and when not to.`,
      commonMistakes: [
        'Using state in event handlers and getting stale values on delayed execution',
        'Creating new functions in render that reference state (performance issue)',
        'Forgetting that const arrays/objects in render are new each render',
      ],
      detailedExplanation: `When you create a function in your component, it captures (closes over) the current values of all variables in its scope. This is useful, but it means the function will always use those values, even if they change.

In React, this becomes a problem when:
1. You save a reference to a function (like setting it as an event listener)
2. The state it references changes
3. The function still uses the old state value

This is why useCallback exists - it memoizes a function so it doesn't change unless its dependencies change.`,
      realWorldExamples: [
        {
          title: 'Stale Closure in Event Handler',
          description: 'The button captures count=0, but state is now 5',
          code: `// ❌ PROBLEM - Stale closure
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    alert(\`Count is: \${count}\`); // Always says 0!
  };

  return (
    <>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={handleClick}>
        Show Count (wrong)
      </button>
    </>
  );
}`,
        },
        {
          title: 'Solution with useCallback',
          description: 'useCallback ensures we always have the latest state',
          code: `// ✅ SOLUTION - Using useRef to get latest value
function Counter() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);

  useEffect(() => {
    countRef.current = count;
  }, [count]);

  const handleClick = () => {
    alert(\`Count is: \${countRef.current}\`); // Gets latest!
  };

  return (
    <>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={handleClick}>
        Show Count (correct)
      </button>
    </>
  );
}`,
        },
      ],
      tips: [
        'Understand that every component render creates new function objects',
        'Use useCallback for callbacks passed to child components to prevent re-renders',
        'Use useRef if you need the latest value without re-rendering',
        'Consider passing state as function parameters instead of closing over it',
      ],
    },
  ],
  javaScript: [
    {
      id: 'js-this-binding',
      title: 'Understanding "this" Context',
      summary: 'The value of "this" is determined by how a function is called, not where it\'s defined',
      difficulty: 'intermediate' as const,
      whyLearnersStruggle: `"this" binding is one of the most confusing concepts in JavaScript because unlike most languages, "this" is dynamic and depends on the execution context. The same function can have different "this" values depending on how it's called.`,
      commonMistakes: [
        'Assuming "this" is bound to the object that contains the method',
        'Passing methods to event listeners without binding, losing context',
        'Not understanding that "this" is determined at call time, not definition time',
        'Using arrow functions in classes and expecting "this" to be the instance (it works, but for different reasons)',
      ],
      detailedExplanation: `In JavaScript, "this" refers to the object that is executing the current function. The crucial point: "this" is determined by HOW the function is called, not WHERE it's defined.

Rules for determining "this" (in order):
1. If called with .call(), .apply(), or .bind(), use their first argument
2. If called as object.method(), "this" is the object
3. If called as a standalone function, "this" is undefined (strict mode) or global object (non-strict)
4. If called with new, "this" is the new object being created
5. Arrow functions don't have their own "this" - they use the "this" from their enclosing scope`,
      realWorldExamples: [
        {
          title: 'Method Lost Context Problem',
          description: 'When you pass a method as a callback, it loses its context:',
          code: `// ❌ PROBLEM - Lost context
class Button {
  constructor(name) {
    this.name = name;
  }

  handleClick() {
    console.log(\`\${this.name} clicked\`);
  }
}

const btn = new Button('Submit');
btn.handleClick(); // Works: "Submit clicked"

setTimeout(btn.handleClick, 1000); 
// Error! "this" is undefined or window
// Function is called without object context`,
        },
        {
          title: 'Solution: Binding Context',
          description: 'Use bind() to lock in the context, or use arrow functions',
          code: `// ✅ SOLUTION 1 - Using bind()
const btn = new Button('Submit');
setTimeout(btn.handleClick.bind(btn), 1000); // Works!

// ✅ SOLUTION 2 - Using arrow function
class Button {
  handleClick = () => {
    console.log(\`\${this.name} clicked\`);
  };
}

// ✅ SOLUTION 3 - Bind in constructor
class Button {
  constructor(name) {
    this.name = name;
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    console.log(\`\${this.name} clicked\`);
  }
}`,
        },
      ],
      tips: [
        'Remember: "this" is determined at call-time, not definition-time',
        'Use arrow functions in callbacks to inherit "this" from the outer scope',
        'Use .bind() when you need to pass a method reference',
        'Be careful with "this" in event listeners',
        'Use the React DevTools to inspect component context issues',
      ],
    },
  ],
  html: [
    {
      id: 'html-semantic',
      title: 'Semantic HTML vs "Div Soup"',
      summary: 'Overusing <div> elements instead of semantic tags like <section>, <article>, and <nav>',
      difficulty: 'beginner' as const,
      whyLearnersStruggle: 'It is visually identical in the browser to use a <div> vs a <section>. Learners often do not see the immediate benefit of semantic tags because the "output" looks the same, leading to "div soup" - deeply nested structures of meaningless divs.',
      commonMistakes: [
        'Using <div onClick={...}> instead of <button>',
        'Using <b> or <i> for styling instead of <strong> or <em> for meaning',
        'Not using <main>, <header>, or <footer> regions',
        'Using <div> for lists instead of <ul> or <ol>',
      ],
      detailedExplanation: `Semantic HTML means using correct HTML tags that convey the meaning of the content, not just its appearance.
      
Benefits of Semantic HTML:
1. Accessibility: Screen readers rely on these tags to navigate the page
2. SEO: Search engines understand your content structure better
3. Maintainability: Code is easier to read and understand`,
      realWorldExamples: [
        {
          title: 'The "Div Soup" Problem',
          description: 'A button made of a div is not accessible by keyboard:',
          code: `<!-- ❌ WRONG: Not accessible -->
<div class="btn" onclick="submit()">Submit</div>`,
        },
        {
          title: 'Semantic Solution',
          description: 'Use the native button element for built-in accessibility:',
          code: `<!-- ✅ CORRECT: Accessible by default -->
<button class="btn" onclick="submit()">Submit</button>`,
        }
      ],
      tips: [
        'If it looks like a button and acts like a button, use <button>',
        'Use <header> for page/section headers, not <div class="header">',
        'Ask yourself: "What is this content?" (navigation? article? list?) and pick the matching tag'
      ]
    }
  ],
  css: [
    {
      id: 'css-box-model',
      title: 'The Box Model & box-sizing',
      summary: 'Confusion about how width, padding, and border add up to the total element size',
      difficulty: 'beginner' as const,
      whyLearnersStruggle: 'By default, CSS adds padding and border TO the width you specify. If you set width: 100px and padding: 20px, the actual width is 140px. This breaks layouts unexpectedly.',
      commonMistakes: [
        'Setting width: 100% and adding padding, creating horizontal scrollbars',
        'Not resetting box-sizing globally',
        'Confusing margin (outside) with padding (inside)'
      ],
      detailedExplanation: `Every element in CSS is a box. The Box Model consists of:
1. Content: The actual text/image
2. Padding: Space around content (inside border)
3. Border: Wrapper around padding
4. Margin: Space outside border

The property 'box-sizing: border-box' changes how width is calculated so that padding and border are INCLUDED in the width.`,
      realWorldExamples: [
        {
          title: 'Layout Breaking without border-box',
          description: 'Adding padding makes the element wider than 100%, causing overflow:',
          code: `/* ❌ WRONG: Causes horizontal scroll */
.box {
  width: 100%;
  padding: 20px;
}`
        },
        {
          title: 'The Global Fix',
          description: 'Apply this reset to all projects to make sizing intuitive:',
          code: `/* ✅ CORRECT: box-sizing reset */
*, *::before, *::after {
  box-sizing: border-box;
}

.box {
  width: 100%;
  padding: 20px; /* Stays within 100% width! */
}`
        }
      ],
      tips: [
        'Always add the box-sizing: border-box reset to your CSS files',
        'Use Chrome DevTools "Computed" tab to visualize the box model',
        'Remember: Margin pushes neighbors away; Padding grows the element (unless border-box is used)'
      ]
    }
  ]
};

/**
 * Template for creating new weak points:
 * 
 * {
 *   id: 'unique-identifier',
 *   title: 'Title of the weak point',
 *   summary: 'One-sentence summary',
 *   difficulty: 'beginner' | 'intermediate' | 'advanced',
 *   whyLearnersStruggle: 'Explanation of why this is confusing',
 *   commonMistakes: ['mistake1', 'mistake2', ...],
 *   detailedExplanation: 'In-depth explanation of the concept',
 *   realWorldExamples: [
 *     {
 *       title: 'Example title',
 *       description: 'What this example shows',
 *       code: 'code snippet',
 *       illustration: 'diagram description'
 *     }
 *   ],
 *   tips: ['tip1', 'tip2', ...]
 * }
 */
