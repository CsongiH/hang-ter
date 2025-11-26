"use client";
const epochMin = 1745142960000; // 2025,04,25
const epochMax = 9999999999999;

const formatTimestamp = (value) => {
    if (value < epochMin || value > epochMax) return value;
    return new Date(value).toLocaleString("hu-HU");
};

const isSimpleValue = (value) =>
    value == null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean";

const formatSimpleValue = (value) => {
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "number") { return formatTimestamp(value); }

    return String(value);
};

const formatArrayValue = (array) => {
    if (array.length === 0) return "-";
    if (array.every(isSimpleValue)) {
        return array.map(formatSimpleValue).join(", ");
    }
    return JSON.stringify(array);
};

const formatValue = (_key, value) => {
    if (value == null) return "-";
    if (value === "") return "-";
    if (Array.isArray(value)) return formatArrayValue(value);
    if (typeof value === "object") return JSON.stringify(value);
    return formatSimpleValue(value);
};

const flattenObject = (obj, prefix = "") => {
    const result = {};
    if (!obj || typeof obj !== "object") return result;

    for (const [key, value] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${key}` : key;

        if (Array.isArray(value)) {
            if (value.every(isSimpleValue)) {
                result[path] = value;
            } else {
                value.forEach((item, index) => {
                    const itemPath = `${path}[${index}]`;
                    result[itemPath] = item;
                });
            }
            continue;
        }

        if (value && typeof value === "object") {
            Object.assign(result, flattenObject(value, path));
            continue;
        }

        result[path] = value;
    }

    return result;
};

export default function AdminDataTable({ data, title, className = "" }) {
    const flattened = flattenObject(data || {});
    const sortedKeys = Object.keys(flattened).sort();

    return (
        <section className={`card ${className}`}>
            {title && <h2 className="h2 mb-2">{title}</h2>}
            <div className="table-wrap">
                <table className="table">
                    <tbody>
                        {sortedKeys.map((key) => (
                            <tr key={key}>
                                <td className="small whitespace-nowrap">{key}</td>
                                <td className="small whitespace-pre-wrap">
                                    {formatValue(key, flattened[key])}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}