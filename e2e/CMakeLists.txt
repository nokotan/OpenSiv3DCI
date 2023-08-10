cmake_minimum_required(VERSION 3.12)
project(OpenSiv3D_Web_e2e_Test CXX C)

if (NOT CMAKE_CONFIGURATION_TYPES AND 
    NOT CMAKE_NO_BUILD_TYPE AND
    NOT CMAKE_BUILD_TYPE AND
    CMAKE_SOURCE_DIR STREQUAL CMAKE_CURRENT_SOURCE_DIR)
    message(STATUS "[!] Setting build type to 'Release' as none was specified.")
    set(CMAKE_BUILD_TYPE Release)
endif()

#
# Siv3D App Definition
#
add_executable(Siv3De2eTest
  Main.cpp
)

#
# General Options
#
find_package(Siv3D REQUIRED)

set(SIV3D_CXX_DEFINITIONS)
set(SIV3D_EXE_LINKER_FLAGS
  -sINCLUDE_FULL_LIBRARY=1
  -sUSE_WEBGPU=1
  --emrun
  --pre-js=${CMAKE_CURRENT_SOURCE_DIR}/Siv3DTest.pre.js
)
set(SIV3D_LINK_LIBRARIES
  -Wl,--whole-archive
    Siv3D::Siv3DWebGPU
  -Wl,--no-whole-archive
    Siv3D::Siv3D
    Siv3D::Siv3DScript
)



#
# Siv3D App Definition
#
target_compile_definitions(Siv3De2eTest PRIVATE ${SIV3D_CXX_DEFINITIONS})
target_compile_features(Siv3De2eTest PRIVATE cxx_std_20)
target_link_options(Siv3De2eTest PRIVATE ${SIV3D_EXE_LINKER_FLAGS})
target_link_libraries(Siv3De2eTest PRIVATE ${SIV3D_LINK_LIBRARIES})

set_target_properties(Siv3De2eTest PROPERTIES
    SUFFIX ".html"
    RUNTIME_OUTPUT_DIRECTORY ${PROJECT_SOURCE_DIR}
)
