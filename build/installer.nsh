!include "MUI2.nsh"
!include "FileFunc.nsh"

Name "JOIN"
OutFile "installer.exe"
Unicode True
InstallDir "$PROGRAMFILES\JOIN"
InstallDirRegKey HKCU "Software\JOIN" ""
RequestExecutionLevel admin

!define MUI_ABORTWARNING
!define MUI_ICON "..\resources\icon.ico"
!define MUI_UNICON "..\resources\icon.ico"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

!insertmacro MUI_LANGUAGE "PortugueseBR"

Section "JOIN" SecApp
  SectionIn RO

  SetOutPath "$INSTDIR"

  # Copy all files from the dist directory
  File /r "..\dist\*.*"

  # Create desktop shortcut
  CreateShortCut "$DESKTOP\JOIN.lnk" "$INSTDIR\JOIN.exe" "" "$INSTDIR\JOIN.exe" 0

  # Create start menu entries
  CreateDirectory "$SMPROGRAMS\JOIN"
  CreateShortCut "$SMPROGRAMS\JOIN\JOIN.lnk" "$INSTDIR\JOIN.exe" "" "$INSTDIR\JOIN.exe" 0
  CreateShortCut "$SMPROGRAMS\JOIN\Uninstall.lnk" "$INSTDIR\uninstall.exe" "" "$INSTDIR\uninstall.exe" 0

  # Registry information for add/remove programs
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\JOIN" "DisplayName" "JOIN"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\JOIN" "UninstallString" "$INSTDIR\uninstall.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\JOIN" "InstallLocation" "$INSTDIR"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\JOIN" "DisplayIcon" "$INSTDIR\JOIN.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\JOIN" "Publisher" "Feerps Studios"
  WriteRegDWord HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\JOIN" "NoModify" 1
  WriteRegDWord HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\JOIN" "NoRepair" 1

  # Create uninstaller
  WriteUninstaller "$INSTDIR\uninstall.exe"

SectionEnd

Section "Uninstall"

  # Remove files
  Delete "$INSTDIR\uninstall.exe"
  RMDir /r "$INSTDIR"

  # Remove shortcuts
  Delete "$DESKTOP\JOIN.lnk"
  RMDir /r "$SMPROGRAMS\JOIN"

  # Remove registry keys
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\JOIN"
  DeleteRegKey HKCU "Software\JOIN"

SectionEnd