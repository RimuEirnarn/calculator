"""Calculator"""
import webview

windows: list[webview.Window] = []

def catch():
    '''a'''
    size = windows[0].evaluate_js("[document.querySelector('#app').offsetWidth, document.querySelector('#app').offsetHeight]")
    windows[0].resize(size[0], size[1])

def main():
    '''entry point'''
    window = webview.create_window(
        "Calculator",
        "index.html",
        frameless=True,
        easy_drag=True,
        background_color="#ffffff",
    )
    windows.append(window)
    webview.start(catch)
    return window


if __name__ == "__main__":
    main()
