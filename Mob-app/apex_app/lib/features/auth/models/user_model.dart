import 'dart:convert';
import 'package:flutter/material.dart';

class UserModel {
  final int    id;
  final String nama;
  final String email;
  final int    roleId;
  final bool   isAdmin;
  final bool   isManager;
  final bool   isSalesOnly;
  final List<String> allowedMenus;
  final String? avatarColor;
  final String? avatarPhoto;

  const UserModel({
    required this.id,
    required this.nama,
    required this.email,
    required this.roleId,
    required this.isAdmin,
    required this.isManager,
    required this.isSalesOnly,
    required this.allowedMenus,
    this.avatarColor,
    this.avatarPhoto,
  });

  Color get resolvedAvatarColor {
    if (avatarColor != null && avatarColor!.startsWith('#') && avatarColor!.length == 7) {
      try {
        return Color(int.parse('FF${avatarColor!.substring(1)}', radix: 16));
      } catch (_) {}
    }
    return const Color(0xFF3B82F6); // default primary
  }

  UserModel copyWith({String? avatarColor, Object? avatarPhoto = _sentinel}) => UserModel(
    id:           id,
    nama:         nama,
    email:        email,
    roleId:       roleId,
    isAdmin:      isAdmin,
    isManager:    isManager,
    isSalesOnly:  isSalesOnly,
    allowedMenus: allowedMenus,
    avatarColor:  avatarColor ?? this.avatarColor,
    avatarPhoto:  avatarPhoto == _sentinel ? this.avatarPhoto : avatarPhoto as String?,
  );

  static const Object _sentinel = Object();

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id:           json['id'] as int,
      nama:         json['nama'] as String,
      email:        json['email'] as String,
      roleId:       json['role_id'] as int,
      isAdmin:      (json['is_admin'] as bool?) ?? (json['role_id'] as int) == 1,
      isManager:    (json['is_manager'] as bool?) ?? (json['role_id'] as int) == 2,
      isSalesOnly:  (json['is_sales_only'] as bool?) ?? (json['role_id'] as int) == 3,
      allowedMenus: List<String>.from(json['allowed_menus'] ?? []),
      avatarColor:  json['avatar_color'] as String?,
      avatarPhoto:  json['avatar_photo'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id':            id,
    'nama':          nama,
    'email':         email,
    'role_id':       roleId,
    'is_admin':      isAdmin,
    'is_manager':    isManager,
    'is_sales_only': isSalesOnly,
    'allowed_menus': allowedMenus,
    'avatar_color':  avatarColor,
    'avatar_photo':  avatarPhoto,
  };

  String get roleName {
    if (isAdmin)     return 'Admin';
    if (isManager)   return 'Manager';
    return 'Sales';
  }

  String toJsonString() => jsonEncode(toJson());

  static UserModel? fromJsonString(String? s) {
    if (s == null) return null;
    try {
      return UserModel.fromJson(jsonDecode(s) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }
}
