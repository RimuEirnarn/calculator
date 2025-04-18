"""Calculator"""
import webview
from argh import dispatch_command

windows: list[webview.Window] = []

class JSAPI:
    pywebview = True

def catch():
    '''a'''
    size = windows[0].evaluate_js("[document.querySelector('#app').offsetWidth, document.querySelector('#app').offsetHeight]")
    windows[0].resize(size[0], size[1])

def main(frameless=False, debug=False):
    '''entry point'''
    base_height = 620
    window = webview.create_window(
        "Calculator",
        "index.html",
        js_api=JSAPI(),
        width=850,
        height=base_height + (40 if frameless is False else 0),
        frameless=frameless,
        easy_drag=True,
        background_color="#ffffff",
    )
    windows.append(window)
    if frameless:
        webview.start(debug=debug)
    else:
        webview.start(debug=debug)


if __name__ == "__main__":
    dispatch_command(main)
