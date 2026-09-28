import os
import sys
import argparse
import shutil

def create_react_structure(app_folder_path, project_name, namespace, app_title=None, app_description=None, 
                           semantic_object=None, action="display", app_subtitle=None, destination_name=None, 
                           cnma_react_ui_version="1.0.25", service_name=None):
    """
    Creates React v2 directory structure by copying from templates and replacing placeholders.
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    template_dir = os.path.normpath(os.path.join(script_dir, "../templates/react-v2"))
    dest_dir = os.path.abspath(app_folder_path)
    
    print(f"Scaffolding React v2 from {template_dir} to {dest_dir}...")
    
    # 1. Copy the entire react-v2 template
    if os.path.exists(dest_dir):
        print(f"Warning: {dest_dir} already exists. Overwriting/Merging...")
        
    try:
        shutil.copytree(template_dir, dest_dir, dirs_exist_ok=True)
    except Exception as e:
        print(f"Error copying templates: {e}")
        return False

    # 2. Copy .npmrc from project root (usually 2 levels up from dest_dir/app/{{project_name}}_ui, or check workspace root)
    # Check parent directory, and grandparent directory for .npmrc
    project_root = os.path.abspath(os.path.join(dest_dir, ".."))
    if not os.path.exists(os.path.join(project_root, ".npmrc")):
        project_root = os.path.abspath(os.path.join(dest_dir, "../.."))
        
    src_npmrc = os.path.join(project_root, ".npmrc")
    dest_npmrc = os.path.join(dest_dir, ".npmrc")
    if os.path.exists(src_npmrc):
        shutil.copy(src_npmrc, dest_npmrc)
        print(f"Copied .npmrc from {src_npmrc} to {dest_npmrc}")
    else:
        print(f"Warning: .npmrc not found in project root: {project_root}")

    # 3. Formulate placeholder values
    module_name = namespace.split(".")[-1] if "." in namespace else "app"
    
    app_title = app_title or f"CNMA {module_name.capitalize()} App"
    app_description = app_description or f"CNMA {module_name.capitalize()} React Application"
    semantic_object = semantic_object or f"Cnma{module_name.capitalize()}"
    app_subtitle = app_subtitle or f"{module_name.capitalize()} App"
    destination_name = destination_name or f"{project_name}-srv-api"
    service_name = service_name or f"{module_name.upper()}_SRV"
    
    # Paths replaced: dots with slash
    namespace_path = namespace.replace(".", "/")
    
    placeholders = {
        "{{project_name}}": project_name,
        "{{NAMESPACE}}": namespace,
        "{{NAMESPACE_PATH}}": namespace_path,
        "{{APP_TITLE}}": app_title,
        "{{APP_DESCRIPTION}}": app_description,
        "{{SEMANTIC_OBJECT}}": semantic_object,
        "{{ACTION}}": action,
        "{{APP_SUBTITLE}}": app_subtitle,
        "{{DESTINATION_NAME}}": destination_name,
        "{{CNMA_REACT_UI_VERSION}}": cnma_react_ui_version,
        "{{SERVICE_NAME}}": service_name
    }
    
    print("Replacing placeholders:")
    for p, v in placeholders.items():
        print(f"  {p} -> {v}")

    # 4. Replace placeholders in all files
    for root, dirs, files in os.walk(dest_dir):
        for file in files:
            file_path = os.path.join(root, file)
            
            # Skip binary files
            if file.endswith(('.png', '.jpg', '.jpeg', '.ico', '.gif', '.zip')):
                continue
                
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                new_content = content
                for placeholder, value in placeholders.items():
                    new_content = new_content.replace(placeholder, value)
                    
                if new_content != content:
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    print(f"  Updated: {os.path.relpath(file_path, dest_dir)}")
            except Exception as e:
                print(f"  Skipping file {file_path}: {e}")

    print(f"React v2 structure scaffolded in {dest_dir}")
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scaffold SAP CAP React v2 Frontend Structure")
    parser.add_argument("app_folder_path", help="Target app folder path (e.g. 'app/cnma_init_ui')")
    parser.add_argument("--project-name", required=True, help="Project MTA name (e.g. 'cnma_init')")
    parser.add_argument("--namespace", required=True, help="Dot-notation namespace (e.g. 'cnma.init')")
    parser.add_argument("--app-title", help="Human-readable app title")
    parser.add_argument("--app-description", help="Short app description")
    parser.add_argument("--semantic-object", help="SAP semantic object")
    parser.add_argument("--action", default="display", help="SAP intent action")
    parser.add_argument("--app-subtitle", help="Short app subtitle")
    parser.add_argument("--destination-name", help="MTA service-key destination name")
    parser.add_argument("--cnma-react-ui-version", default="1.0.25", help="Version of @cnma/react-ui")
    parser.add_argument("--service-name", help="OData service path name (e.g. 'INIT_SRV')")
    
    args = parser.parse_args()
    
    success = create_react_structure(
        app_folder_path=args.app_folder_path,
        project_name=args.project_name,
        namespace=args.namespace,
        app_title=args.app_title,
        app_description=args.app_description,
        semantic_object=args.semantic_object,
        action=args.action,
        app_subtitle=args.app_subtitle,
        destination_name=args.destination_name,
        cnma_react_ui_version=args.cnma_react_ui_version,
        service_name=args.service_name
    )
    
    if not success:
        sys.exit(1)
