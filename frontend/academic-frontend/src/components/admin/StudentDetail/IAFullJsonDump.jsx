
// C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\StudentDetail\IAFullJsonDump.jsx
import React from 'react';

const IAFullJsonDump = ({ data }) => (
  <details className="mt-4 bg-gray-50 p-3 rounded">
    <summary className="cursor-pointer font-medium">Ver JSON completo</summary>
    <pre className="mt-2 text-xs overflow-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  </details>
);

export default IAFullJsonDump;
