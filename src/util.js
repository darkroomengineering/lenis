export function getSnapLength(obj, snapVal, axis='horizontal') {
	const clientSize = axis === 'horizontal' ? 'clientWidth' : 'clientHeight';

	const declaration = parseUnitValue(snapVal)
	// get y snap length based on declaration unit
	if (declaration.unit === 'vh') {
		return (
			(Math.max(document.documentElement.clientHeight, window.innerHeight || 1) / 100) *
			declaration.value
		)
	} else if (declaration.unit === 'vw') {
		return (
			(Math.max(document.documentElement.clientWidth, window.innerWidth || 1) / 100) *
			declaration.value
		)
	} else if (declaration.unit === '%') {
		return (obj[clientSize] / 100) * declaration.value
	} else {
		return declaration.value
	}
}

function parseUnitValue(unitValue) {
	// regex to parse lengths
	const regex = /([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*)(?:[eE][+-]?\d+)?)(px|%|vw|vh)/
	// defaults
	let parsed = {
		value: 0,
		unit: 'px',
	}

	if (typeof unitValue === 'number') {
		parsed.value = unitValue
	} else {
		const match = regex.exec(unitValue)
		if (match !== null) {
			parsed = {
				value: Number(match[1]),
				unit: match[2],
			}
		}
	}

	return parsed
}