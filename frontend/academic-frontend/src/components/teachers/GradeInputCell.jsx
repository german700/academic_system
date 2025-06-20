//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\GradeInputCell.jsx
import React from "react";
import { Input } from "../shared/ui/input";

export default function GradeInputCell({ value, late, onChange }) {
    const handleScoreChange = (e) => {
        const val = e.target.value === "" ? "" : parseFloat(e.target.value);
        if (val === "" || (val >= 1 && val <= 5)) {
            onChange({ score: val, late_submission: late });
        }
    };

    const handleLateChange = (e) => {
        onChange({ score: value, late_submission: e.target.checked });
    };

    return (
        <div className="flex flex-col items-center gap-1">
            <Input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={value ?? ""}
                onChange={handleScoreChange}
                className="w-16 text-center"
            />
            <label className="text-xs text-gray-500 flex items-center">
                <input
                    type="checkbox"
                    checked={late || false}
                    onChange={handleLateChange}
                    className="mr-1 w-3 h-3"
                />
                Tarde
            </label>
        </div>
    );
}