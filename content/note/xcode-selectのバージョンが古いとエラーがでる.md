---
title: xcode-selectのバージョンが古いとエラーがでる
date: '2022-09-14T23:36:00+09:00'
tags:
  - 'Mac'
---

```shell
$ /usr/bin/git
2022-09-14 19:57:46.548 xcodebuild[4220:18896] [MT] DVTPlugInLoading: Failed to load code for plug-in com.apple.dt.IDESimulatorAvailability (/Applications/Xcode.app/Contents/PlugIns/IDESimulatorAvailability.ideplugin), error = Error Domain=NSCocoaErrorDomain Code=3588 "dlopen(/Applications/Xcode.app/Contents/PlugIns/IDESimulatorAvailability.ideplugin/Contents/MacOS/IDESimulatorAvailability, 0x0109): Symbol not found: (_OBJC_CLASS_$_SimDiskImage)
  Referenced from: '/Applications/Xcode.app/Contents/PlugIns/IDESimulatorAvailability.ideplugin/Contents/MacOS/IDESimulatorAvailability'
  Expected in: '/Library/Developer/PrivateFrameworks/CoreSimulator.framework/Versions/A/CoreSimulator'" UserInfo={NSLocalizedFailureReason=The bundle couldn’t be loaded., NSLocalizedRecoverySuggestion=Try reinstalling the bundle., NSFilePath=/Applications/Xcode.app/Contents/PlugIns/IDESimulatorAvailability.ideplugin/Contents/MacOS/IDESimulatorAvailability, NSDebugDescription=dlopen(/Applications/Xcode.app/Contents/PlugIns/IDESimulatorAvailability.ideplugin/Contents/MacOS/IDESimulatorAvailability, 0x0109): Symbol not found: (_OBJC_CLASS_$_SimDiskImage)
  Referenced from: '/Applications/Xcode.app/Contents/PlugIns/IDESimulatorAvailability.ideplugin/Contents/MacOS/IDESimulatorAvailability'
  Expected in: '/Library/Developer/PrivateFrameworks/CoreSimulator.framework/Versions/A/CoreSimulator', NSBundlePath=/Applications/Xcode.app/Contents/PlugIns/IDESimulatorAvailability.ideplugin, NSLocalizedDescription=The bundle “IDESimulatorAvailability” couldn’t be loaded.}, dyldError = dlopen(/Applications/Xcode.app/Contents/PlugIns/IDESimulatorAvailability.ideplugin/Contents/MacOS/IDESimulatorAvailability, 0x0000): Symbol not found: (_OBJC_CLASS_$_SimDiskImage)
  Referenced from: '/Applications/Xcode.app/Contents/PlugIns/IDESimulatorAvailability.ideplugin/Contents/MacOS/IDESimulatorAvailability'
  Expected in: '/Library/Developer/PrivateFrameworks/CoreSimulator.framework/Versions/A/CoreSimulator'
2022-09-14 19:57:46.570 xcodebuild[4220:18896] [MT] DVTAssertions: ASSERTION FAILURE in /System/Volumes/Data/SWE/Apps/DT/BuildRoots/BuildRoot2/ActiveBuildRoot/Library/Caches/com.apple.xbs/Sources/DVTFrameworks/DVTFrameworks-21303/DVTFoundation/PlugInArchitecture/DataModel/DVTPlugIn.m:374
Details:  Failed to load code for plug-in com.apple.dt.IDESimulatorAvailability (/Applications/Xcode.app/Contents/PlugIns/IDESimulatorAvailability.ideplugin)
Please ensure Xcode packages are up-to-date — try running 'xcodebuild -runFirstLaunch'.

NSBundle error: Error Domain=NSCocoaErrorDomain Code=3588 "dlopen(/Applications/Xcode.app/Contents/PlugIns/IDESimulatorAvailability.ideplugin/Contents/MacOS/IDESimulatorAvailability, 0x0109): Symbol not found: (_OBJC_CLASS_$_SimDiskImage)
  Referenced from: '/Applications/Xcode.app/Contents/PlugIns/IDESimulatorAvailability.ideplugin/Contents/MacOS/IDESimulatorAvailability'
  Expected in: '/Library/Developer/PrivateFrameworks/CoreSimulator.framework/Versions/A/CoreSimulator'" UserInfo={NSLocalizedFailureReason=The bundle couldn’t be loaded., NSLocalizedRecoverySuggestion=Try reinstalling the bundle., NSFilePath=/Applications/Xcode.app/Contents/PlugIns/IDESimulatorAvailability.ideplugin/Contents/MacOS/IDESimulatorAvailability, NSDebugDescription=dlopen(/Applications/Xcode.app/Contents/PlugIns/IDESimulatorAvailability.ideplugin/Contents/MacOS/IDESimulatorAvailability, 0x0109): Symbol not found: (_OBJC_CLASS_$_SimDiskImage)
  Referenced from: '/Applications/Xcode.app/Contents/PlugIns/IDESimulatorAvailability.ideplugin/Contents/MacOS/IDESimulatorAvailability'
  Expected in: '/Library/Developer/PrivateFrameworks/CoreSimulator.framework/Versions/A/CoreSimulator', NSBundlePath=/Applications/Xcode.app/Contents/PlugIns/IDESimulatorAvailability.ideplugin, NSLocalizedDescription=The bundle “IDESimulatorAvailability” couldn’t be loaded.}
Object:   <DVTPlugIn: 0x60000126a3a0>
Method:   -loadAssertingOnError:error:
Thread:   <_NSMainThread: 0x60000363c2c0>{number = 1, name = main}
Hints:

Backtrace:
  0  0x0000000105ef9410
  1  0x0000000105ef8aec
  2  0x0000000105ef8c6c
  3  0x0000000105da72ac
4  0x0000000105d6d118
  5  0x0000000105d6b528
  6  0x00000001af9541b4
  7  0x00000001af963414
  8  0x0000000105f3d58c
  9  0x0000000105f194b0
 10  0x0000000105d6b3c0
 11  0x0000000105d6b5e0
 12  0x0000000106e2f2ec
 13  0x0000000106e2eae0
 14  0x0000000106e2e1e8
 15  0x00000001047cc324
 16  0x0000000104375e0c
sh: line 1:  4240 Abort trap: 6           /Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild -sdk /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk -find git 2> /dev/null
git: error: sh -c '/Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild -sdk /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk -find git 2> /dev/null' failed with exit code 34304: (null) (errno=Invalid argument)
xcode-select: Failed to locate 'git', requesting installation of command line developer tools.
```

xcodeとCommandLineToolsをアップデートした。
→ アップデートが成功しない…

xcodeとCLTをアンインストールしてから再インストールすることに。

以下を削除

- /Applications/Xcode.app
- /Library/Developer/CommandLineTools
- ~/Library/Developer
- ~/Library/Caches/com.apple.dt.Xcode
