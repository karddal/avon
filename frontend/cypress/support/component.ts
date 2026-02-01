import "./commands"
import "../../src/app/globals.css"

class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}

global.ResizeObserver = global.ResizeObserver || ResizeObserverMock