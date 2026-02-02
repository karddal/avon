import "./commands"
import "../../src/app/globals.css"

class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}

global.ResizeObserver = global.ResizeObserver || ResizeObserverMock

if (!globalThis.matchMedia) {
    globalThis.matchMedia = (query: string)=> ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    })
}