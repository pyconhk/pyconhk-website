function isDOMReady(fn) {
	if (typeof fn !== 'function') return;

	if (document.readyState === 'complete') {
		return fn();
	}

	document.addEventListener('DOMContentLoaded', fn, false);
}

isDOMReady(function () {
	const animationClasses = ['.is-style-slide-up-fade-in', '.is-style-slide-down-fade-in', '.is-style-slide-left-fade-in', '.is-style-slide-right-fade-in', '.is-style-clipIn'];
	function scrollTrigger(selector, options = {}) {
		const elements = [];
		selector.forEach(selector => {
			const els = document.querySelectorAll(selector);
			elements.push(...Array.from(els));
		});
		elements.forEach(el => {
			addObserver(el, options);
		});
	}
	function addObserver(el, options) {
		if (!('IntersectionObserver' in window)) {
			entry.target.classList.add('animate');
			return;
		}
		let observer = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('animate');
					observer.unobserve(entry.target);
				}
			})
		}, options)
		observer.observe(el)
	}
	scrollTrigger(animationClasses, {
		rootMargin: '0px'
	});
})